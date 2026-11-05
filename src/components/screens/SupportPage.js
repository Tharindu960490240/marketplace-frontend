import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import {
  AddRounded,
  ArrowBackRounded,
  Close,
  ForumOutlined,
  SendRounded,
  SupportAgentOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/support.css";

import * as AppConst from "../../const/const";
import {
  closeSupportTicket,
  createSupportTicket,
  getSupportMessages,
  getSupportTickets,
  sendSupportMessage,
} from "../../services/supportService";
import { get_token } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotifyContext";
import StatusChip from "../common/StatusChip";
import EmptyState from "../common/EmptyState";
import PageLoader from "../common/PageLoader";
import ConfirmDialog from "../common/ConfirmDialog";
import AdminNav from "../common/AdminNav";
import "../styles/admin.css";

const TICKETS_POLL_MS = 30000;
const MESSAGES_POLL_MS = 10000;

const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysAgo = (date) =>
  Math.floor((dayStart(new Date()) - dayStart(date)) / 86400000);

const SupportPage = () => {
  const { t, i18n } = useTranslation();
  const notify = useNotify();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const locale = i18n.language === "si" ? "si-LK" : "en-GB";

  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const [newOpen, setNewOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "" });
  const [newSubmitted, setNewSubmitted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const chatEndRef = useRef(null);
  const selectedId = selected?.id;

  /* ================= LOADERS ================= */
  const loadTickets = useCallback(async () => {
    const token = await get_token();
    const res = await getSupportTickets(token);
    if (res.success) {
      setTickets(res.data);
      // keep the open ticket's status in sync
      setSelected((prev) =>
        prev ? res.data.find((tk) => tk.id === prev.id) || prev : prev,
      );
    } else {
      notify(t("support_page.tickets_load_failed"), "error");
    }
    setTicketsLoading(false);
  }, [notify, t]);

  const loadMessages = useCallback(
    async (ticketId, { silent = false } = {}) => {
      if (!silent) setMessagesLoading(true);
      const token = await get_token();
      const res = await getSupportMessages(token, ticketId);
      if (res.success) {
        setMessages(res.data);
        window.dispatchEvent(new Event("notificationUpdated"));
      } else if (!silent) {
        notify(t("support_page.messages_load_failed"), "error");
      }
      setMessagesLoading(false);
    },
    [notify, t],
  );

  useEffect(() => {
    loadTickets();
    const timer = setInterval(loadTickets, TICKETS_POLL_MS);
    return () => clearInterval(timer);
  }, [loadTickets]);

  // Load messages once per opened ticket, then refresh quietly
  useEffect(() => {
    if (!selectedId) return undefined;
    loadMessages(selectedId);
    const timer = setInterval(
      () => loadMessages(selectedId, { silent: true }),
      MESSAGES_POLL_MS,
    );
    return () => clearInterval(timer);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  /* ================= ACTIONS ================= */
  const openTicket = (ticket) => {
    setSelected(ticket);
    setReply("");
    setTickets((prev) =>
      prev.map((tk) => (tk.id === ticket.id ? { ...tk, unread_count: 0 } : tk)),
    );
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = reply.trim();
    if (!text || !selected || sending) return;

    setSending(true);
    const token = await get_token();
    const res = await sendSupportMessage(token, { ticketId: selected.id, message: text });
    setSending(false);

    if (res.success) {
      setReply("");
      loadMessages(selected.id, { silent: true });
      loadTickets();
    } else {
      notify(res.message || t("support_page.message_send_failed"), "error");
    }
  };

  const handleReplyKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setNewSubmitted(true);
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;

    setCreating(true);
    const token = await get_token();
    const res = await createSupportTicket(token, {
      subject: newTicket.subject.trim(),
      message: newTicket.message.trim(),
    });
    setCreating(false);

    if (res.success) {
      notify(t("support_page.ticket_created"));
      setNewOpen(false);
      setNewTicket({ subject: "", message: "" });
      setNewSubmitted(false);
      loadTickets();
    } else {
      notify(res.message || t("support_page.ticket_create_failed"), "error");
    }
  };

  const handleCloseTicket = async () => {
    setCloseOpen(false);
    const token = await get_token();
    const res = await closeSupportTicket(token, selected.id);
    if (res.success) {
      notify(t("support_page.ticket_close_success"));
      setSelected((prev) => (prev ? { ...prev, status: "closed" } : prev));
      loadTickets();
    } else {
      notify(res.message || t("support_page.ticket_close_failed"), "error");
    }
  };

  /* ================= FORMATTING ================= */
  const dateLabel = (value) => {
    const date = new Date(value);
    const diff = daysAgo(date);
    if (diff === 0) return t("common.today");
    if (diff === 1) return t("common.yesterday");
    return date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
  };

  const previewTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const diff = daysAgo(date);
    if (diff === 0) return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    if (diff === 1) return t("common.yesterday");
    if (diff < 7) return date.toLocaleDateString(locale, { weekday: "short" });
    return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };

  const grouped = messages.reduce((acc, msg) => {
    const key = new Date(msg.created_at).toDateString();
    (acc[key] = acc[key] || []).push(msg);
    return acc;
  }, {});

  const visibleTickets = tickets.filter((tk) => filter === "all" || tk.status === filter);
  const isClosed = selected?.status === "closed";

  return (
    <div className="support-screen">
      {/* Admins get the section nav here, same as the other admin pages */}
      {isAdmin && <AdminNav className="admin-nav-bar support-admin-bar" />}

      <div className={`support-page ${selected ? "chat-open" : ""}`}>
      {/* ================= TICKET LIST ================= */}
      <aside className="support-list">
        <div className="support-list-head">
          <h1>{t("support_page.title")}</h1>
          {!isAdmin && (
            <Button
              size="small"
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setNewOpen(true)}
            >
              {t("support_page.new_ticket")}
            </Button>
          )}
        </div>

        <ToggleButtonGroup
          className="support-filter"
          size="small"
          exclusive
          fullWidth
          value={filter}
          onChange={(_e, v) => v && setFilter(v)}
        >
          <ToggleButton value="all">{t("support_page.filter_all")}</ToggleButton>
          <ToggleButton value="open">{t("support_page.filter_open")}</ToggleButton>
          <ToggleButton value="closed">{t("support_page.filter_closed")}</ToggleButton>
        </ToggleButtonGroup>

        <div className="ticket-list">
          {ticketsLoading && <PageLoader minHeight={160} />}

          {!ticketsLoading && visibleTickets.length === 0 && (
            <EmptyState
              compact
              icon={<ForumOutlined />}
              title={t("support_page.no_tickets")}
              text={isAdmin ? "" : t("support_page.no_tickets_hint")}
            />
          )}

          {visibleTickets.map((tk) => (
            <button
              key={tk.id}
              className={`ticket-item ${selectedId === tk.id ? "active" : ""}`}
              onClick={() => openTicket(tk)}
            >
              <Avatar
                src={tk.profile_image || AppConst.PROFILE_PLACEHOLDER_IMAGE}
                sx={{ width: 40, height: 40 }}
              />
              <div className="ticket-text">
                <div className="ticket-line">
                  <strong>{tk.subject}</strong>
                  <span className="ticket-time">{previewTime(tk.updated_at)}</span>
                </div>
                <div className="ticket-line">
                  <span className="ticket-meta">
                    {isAdmin && tk.first_name ? `${tk.first_name} / ` : ""}
                    {t(`status.${tk.status}`, { defaultValue: tk.status })}
                  </span>
                  {tk.unread_count > 0 && <span className="unread-badge">{tk.unread_count}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ================= CHAT ================= */}
      <section className="support-chat">
        {!selected ? (
          <EmptyState
            icon={<SupportAgentOutlined />}
            title={t("support_page.select_ticket")}
            text={t("support_page.select_ticket_hint")}
          />
        ) : (
          <>
            <header className="chat-head">
              <IconButton
                className="chat-back"
                onClick={() => setSelected(null)}
                aria-label={t("common.back")}
              >
                <ArrowBackRounded />
              </IconButton>
              <div className="chat-title">
                <h2>{selected.subject}</h2>
                <StatusChip status={selected.status} />
              </div>
              {isAdmin && !isClosed && (
                <Button size="small" variant="outlined" color="warning" onClick={() => setCloseOpen(true)}>
                  {t("support_page.close_ticket")}
                </Button>
              )}
            </header>

            <div className="chat-body">
              {messagesLoading && <PageLoader minHeight={200} />}

              {!messagesLoading &&
                Object.entries(grouped).map(([key, msgs]) => (
                  <div key={key} className="message-group">
                    <div className="date-separator">{dateLabel(msgs[0].created_at)}</div>
                    {msgs.map((msg) => {
                      const mine = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`chat-msg ${mine ? "mine" : "theirs"}`}>
                          <p>{msg.message}</p>
                          <time>
                            {new Date(msg.created_at).toLocaleTimeString(locale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        </div>
                      );
                    })}
                  </div>
                ))}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSend}>
              <TextField
                multiline
                maxRows={4}
                placeholder={isClosed ? t("support_page.ticket_closed") : t("support_page.type_reply")}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={handleReplyKey}
                disabled={isClosed}
                inputProps={{ "aria-label": t("support_page.type_reply"), maxLength: 2000 }}
              />
              <Tooltip title={t("support_page.send")}>
                <span>
                  <IconButton
                    type="submit"
                    className="send-btn"
                    disabled={!reply.trim() || isClosed || sending}
                    aria-label={t("support_page.send")}
                  >
                    <SendRounded />
                  </IconButton>
                </span>
              </Tooltip>
            </form>
          </>
        )}
      </section>

      {/* ================= NEW TICKET ================= */}
      <Dialog open={newOpen} onClose={creating ? undefined : () => setNewOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleCreateTicket} noValidate>
          <DialogTitle>
            {t("support_page.new_ticket")}
            <IconButton
              onClick={() => setNewOpen(false)}
              aria-label={t("common.close")}
              sx={{ position: "absolute", right: 12, top: 12 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className="dialog-fields">
              <TextField
                label={t("support_page.subject")}
                autoFocus
                value={newTicket.subject}
                onChange={(e) => setNewTicket((n) => ({ ...n, subject: e.target.value }))}
                error={newSubmitted && !newTicket.subject.trim()}
                helperText={
                  newSubmitted && !newTicket.subject.trim() ? t("support_page.subject_required") : ""
                }
                inputProps={{ maxLength: 120 }}
              />
              <TextField
                label={t("support_page.message")}
                multiline
                minRows={4}
                value={newTicket.message}
                onChange={(e) => setNewTicket((n) => ({ ...n, message: e.target.value }))}
                error={newSubmitted && !newTicket.message.trim()}
                helperText={
                  newSubmitted && !newTicket.message.trim() ? t("support_page.message_required") : ""
                }
                inputProps={{ maxLength: 2000 }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setNewOpen(false)} disabled={creating}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="contained" disabled={creating}>
              {t("support_page.create_ticket")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={closeOpen}
        title={t("support_page.close_ticket")}
        message={t("support_page.close_ticket_confirm")}
        confirmLabel={t("support_page.close_ticket")}
        onConfirm={handleCloseTicket}
        onClose={() => setCloseOpen(false)}
      />
      </div>
    </div>
  );
};

export default SupportPage;