import React, { useEffect, useState, useRef, useCallback } from "react";
import "../styles/support.css";

import {
  TextField,
  IconButton,
  InputAdornment,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import { ArrowBack, Message, Subject, Send } from "@mui/icons-material";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import {
  getSupportTickets,
  getSupportMessages,
  sendSupportMessage,
  createSupportTicket,
  closeSupportTicket,
} from "../../services/supportService";

import * as AppConst from "../../const/const";

import { get_token, getProfile } from "../../services/authService";

const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [subject, setSubject] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [replyInput, setReplyInput] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);

  const [errors, setErrors] = useState({
    subject: false,
    message: false,
  });

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const chatEndRef = useRef(null);

  const [ticketFilter, setTicketFilter] = useState("all");

  // ================= SNACKBAR =================
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // ================= LOAD USER =================
  const loadUser = useCallback(async () => {
    try {
      const token = await get_token();
      if (!token)
        return showSnackbar("Session expired. Please login again.", "error");

      const res = await getProfile(token);

      if (!res.success) {
        return showSnackbar(res.message || "Failed to load profile", "error");
      }
      setUser(res.user);
    } catch (err) {
      showSnackbar("Failed to load user profile", "error");
    }
  }, []);

  // ================= LOAD TICKETS =================
  const loadTickets = useCallback(async () => {
    try {
      const token = await get_token();
      if (!token)
        return showSnackbar("Session expired. Please login again.", "error");

      const res = await getSupportTickets(token);

      if (!res.success) {
        return showSnackbar(
          res.message || "Failed to load support tickets",
          "error",
        );
      }

      const enriched = res.data.map((t) => ({
        ...t,
        lastMessage: t.last_message || "No messages yet",
        unreadCount: t.unread_count || 0,
      }));

      setTickets(enriched);
    } catch (err) {
      showSnackbar("Something went wrong while loading tickets", "error");
    }
  }, []);

  // ================= LOAD MESSAGES =================
  const loadMessages = useCallback(async (ticket) => {
    try {
      const token = await get_token();
      if (!token)
        return showSnackbar("Session expired. Please login again.", "error");

      const res = await getSupportMessages(token, ticket.id);

      if (!res.success) {
        return showSnackbar(res.message || "Failed to load messages", "error");
      }

      setMessages(res.data);
      window.dispatchEvent(new Event("notificationUpdated"));
    } catch (err) {
      showSnackbar("Failed to load messages", "error");
    }
  }, []);

  // ================= CREATE TICKET =================
  const handleCreateTicket = async () => {
    setSubmitted(true);

    const subjectError = !subject.trim();
    const messageError = !messageInput.trim();

    setErrors({
      subject: subjectError,
      message: messageError,
    });

    if (subjectError || messageError) {
      return showSnackbar(
        "Please fill in all required fields correctly",
        "error",
      );
    }

    try {
      setLoading(true);

      const token = await get_token();
      if (!token)
        return showSnackbar("Session expired. Please login again.", "error");

      const res = await createSupportTicket(token, {
        subject,
        message: messageInput,
      });

      if (!res.success) {
        return showSnackbar(
          res.message || "Failed to create support ticket",
          "error",
        );
      }

      setSubject("");
      setMessageInput("");
      setSubmitted(false);
      setErrors({ subject: false, message: false });
      showSnackbar("Ticket created successfully");
      loadTickets();
    } catch (err) {
      showSnackbar("Something went wrong while creating ticket", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND MESSAGE =================
  const handleSendMessage = async () => {
    if (!replyInput.trim() || !selectedTicket)
      return showSnackbar("Message cannot be empty", "error");

    try {
      setLoading(true);

      const token = await get_token();
      if (!token)
        return showSnackbar("Session expired. Please login again.", "error");

      const res = await sendSupportMessage(token, {
        ticketId: selectedTicket.id,
        message: replyInput,
      });

      if (!res.success) {
        return showSnackbar(res.message || "Failed to send message", "error");
      }

      setReplyInput("");
      loadMessages(selectedTicket);
      loadTickets();
    } catch (err) {
      showSnackbar("Something went wrong while sending message", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN CHAT =================
  const openChat = (ticket) => {
    setSelectedTicket(ticket);
    loadMessages(ticket);
    setIsMobileChatOpen(true);
  };

  const closeChat = () => {
    setSelectedTicket(null);
    setMessages([]);
    setIsMobileChatOpen(false);
  };

  // ================= EFFECTS =================
  useEffect(() => {
    loadUser();
    loadTickets();
  }, [loadUser, loadTickets]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket);
    }
  }, [selectedTicket, loadMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getDayStart = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((msg) => {
      const date = new Date(msg.created_at);
      const dayKey = date.toDateString();

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }

      groups[dayKey].push(msg);
    });

    return groups;
  };

  const getDateLabel = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const dateStart = getDayStart(date);
    const nowStart = getDayStart(now);

    const diffDays = Math.floor((nowStart - dateStart) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    return date.toLocaleDateString([], {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const formatTicketPreviewTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const getDayStart = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffDays = Math.floor(
      (getDayStart(now) - getDayStart(date)) / (1000 * 60 * 60 * 24),
    );

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // TODAY → show time only
    if (diffDays === 0) return time;

    // YESTERDAY → WhatsApp style
    if (diffDays === 1) return "Yesterday";

    // THIS WEEK → weekday only
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    // OLDER → full date
    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  };

  // ================= FILTER =================
  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === "all") return true;
    return t.status === ticketFilter;
  });

  // ================= CLOSE TICKET =================
  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      setLoading(true);

      const token = await get_token();
      if (!token)
        return showSnackbar("Session expired. Please login again.", "error");

      const res = await closeSupportTicket(token, selectedTicket.id);

      if (!res.success) {
        return showSnackbar(res.message || "Failed to close ticket", "error");
      }

      showSnackbar("Ticket closed successfully");
      loadTickets();
      setSelectedTicket((prev) =>
        prev ? { ...prev, status: "closed" } : prev,
      );
    } catch (err) {
      showSnackbar("Something went wrong while closing ticket", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-container">
      {/* LEFT */}
      <div className={`support-left ${isMobileChatOpen ? "hide-mobile" : ""}`}>
        <h3>Support</h3>

        {/* FILTER DROPDOWN */}
        <div className="ticket-filter">
          <FormControl fullWidth size="small" className="custom-textfield">
            <InputLabel>Filter Tickets</InputLabel>
            <Select
              value={ticketFilter}
              label="Filter Tickets"
              onChange={(e) => setTicketFilter(e.target.value)}
            >
              <MenuItem value="all">All Tickets</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </div>

        {user?.role !== "admin" && (
          <div className="new-ticket">
            <TextField
              size="small"
              fullWidth
              label="Subject"
              required
              value={subject}
              error={submitted && errors.subject}
              helperText={
                submitted && errors.subject ? "Subject is required" : ""
              }
              onChange={(e) => setSubject(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Subject />
                  </InputAdornment>
                ),
              }}
              className="custom-textfield"
            />

            <TextField
              required
              fullWidth
              multiline
              rows={3}
              label="Message"
              value={messageInput}
              error={submitted && errors.message}
              helperText={
                submitted && errors.message ? "Message is required" : ""
              }
              onChange={(e) => setMessageInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Message />
                  </InputAdornment>
                ),
              }}
              className="custom-textfield"
              style={{ marginTop: 10 }}
            />

            <button className="button-success" onClick={handleCreateTicket}>
              Create Ticket
            </button>
          </div>
        )}

        <div className="ticket-list">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className={`ticket-item ${
                selectedTicket?.id === t.id ? "active" : ""
              }`}
              onClick={() => openChat(t)}
            >
              <div className="ticket-header">
                <div className="ticket-user">
                  <Avatar
                    src={
                      t.profile_image
                        ? AppConst.PROFILE_PLACEHOLDER_IMAGE + t.profile_image
                        : AppConst.PROFILE_PLACEHOLDER_IMAGE +
                          "uploads/profile_pic/user.png"
                    }
                  />

                  <div className="ticket-meta">
                    <strong>{t.subject}</strong>

                    {user?.role === "admin" && (
                      <div className="ticket-user-name">{t.first_name}</div>
                    )}
                  </div>
                </div>

                <div className="ticket-right">
                  {t.unreadCount > 0 && (
                    <span className="unread-badge">{t.unreadCount}</span>
                  )}
                </div>
              </div>

              <div className="last-message-row">
                <span className="last-message">{t.lastMessage}</span>
                <span className="ticket-time">
                  {formatTicketPreviewTime(t.updated_at)}
                </span>
              </div>
              <span className="status">{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div
        className={`support-right ${
          !isMobileChatOpen ? "hide-mobile-chat" : ""
        }`}
      >
        {!selectedTicket ? (
          <div className="empty">Select a ticket</div>
        ) : (
          <>
            <div className="chat-header">
              <IconButton className="back-btn" onClick={closeChat}>
                <ArrowBack />
              </IconButton>
              <div style={{ flex: 1 }}>
                <h4>{selectedTicket.subject}</h4>
                <small>{selectedTicket.status}</small>
              </div>

              {user?.role === "admin" && selectedTicket.status !== "closed" && (
                <button className="button-warning" onClick={handleCloseTicket}>
                  Close Ticket
                </button>
              )}
            </div>

            <div className="chat-body">
              {Object.entries(groupMessagesByDate(messages)).map(
                ([dateKey, msgs]) => (
                  <div key={dateKey} className="message-group">
                    {/* DATE SEPARATOR */}
                    <div className="date-separator">
                      {getDateLabel(msgs[0].created_at)}
                    </div>

                    {/* MESSAGES */}
                    {msgs.map((msg) => (
                      <div
                        key={msg.id}
                        className={`chat-msg ${
                          msg.sender_id === selectedTicket.user_id
                            ? "user"
                            : "admin"
                        }`}
                      >
                        {msg.message}

                        <div className="msg-time">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input">
              <TextField
                className="custom-textfield"
                fullWidth
                placeholder={
                  selectedTicket?.status === "closed"
                    ? "Ticket is closed"
                    : "Type reply..."
                }
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                disabled={selectedTicket?.status === "closed"}
              />

              <IconButton
                onClick={handleSendMessage}
                disabled={
                  !replyInput.trim() || selectedTicket?.status === "closed"
                }
              >
                <Send />
              </IconButton>
            </div>
          </>
        )}
      </div>

      <LoadingSpinner open={loading} />
      <CustomSnackbar {...snackbar} onClose={closeSnackbar} />
    </div>
  );
};

export default SupportPage;
