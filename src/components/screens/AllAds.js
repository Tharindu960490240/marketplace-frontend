import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IconButton,
  InputAdornment,
  LinearProgress,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  BlockRounded,
  CampaignOutlined,
  CheckCircleOutline,
  DeleteOutline,
  SearchRounded,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/dataTable.css";

import * as AppConst from "../../const/const";
import { getAds, updateAdStatus } from "../../services/adsService";
import { get_token } from "../../services/authService";
import { useNotify } from "../../context/NotifyContext";
import useDebounce from "../../hooks/useDebounce";
import { formatDate, formatLocation, formatNumber, formatPrice } from "../../utils/format";
import AdminLayout from "../common/AdminLayout";
import StatusChip from "../common/StatusChip";
import EmptyState from "../common/EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";
import ShareButton from "./ShareButton";

const STATUS_TABS = ["pending", "active", "sold", "rejected", "deleted"];

const AllAds = () => {
  const { t, i18n } = useTranslation();
  const notify = useNotify();

  const [tab, setTab] = useState(0);
  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 450);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [reject, setReject] = useState({ id: null, reason: "", submitted: false });

  useEffect(() => setPage(0), [debouncedSearch, tab, rowsPerPage]);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    const token = await get_token();
    const res = await getAds(
      { page: page + 1, limit: rowsPerPage, search: debouncedSearch, status: STATUS_TABS[tab] },
      token,
    );
    if (res.success) {
      setAds(res.data);
      setTotal(res.total);
    } else {
      notify(t("all_ads_page.load_error"), "error");
    }
    setLoading(false);
  }, [page, rowsPerPage, debouncedSearch, tab, notify, t]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const setStatus = async (id, status, successMsg, errorMsg, reason = null) => {
    setBusy(true);
    const token = await get_token();
    const res = await updateAdStatus(token, id, status, reason);
    setBusy(false);

    if (res.success) {
      notify(successMsg);
      fetchAds();
      return true;
    }
    notify(res.message || errorMsg, "error");
    return false;
  };

  const handleReject = async () => {
    setReject((r) => ({ ...r, submitted: true }));
    if (!reject.reason.trim()) return;

    const ok = await setStatus(
      reject.id,
      "rejected",
      t("all_ads_page.reject_success"),
      t("all_ads_page.reject_error"),
      reject.reason.trim(),
    );
    if (ok) setReject({ id: null, reason: "", submitted: false });
  };

  const handleDelete = async () => {
    const ok = await setStatus(
      deleteId,
      "deleted",
      t("all_ads_page.delete_success"),
      t("all_ads_page.delete_error"),
    );
    if (ok) setDeleteId(null);
  };

  const reasonError = reject.submitted && !reject.reason.trim();

  return (
    <AdminLayout title={t("all_ads_page.title")} subtitle={t("all_ads_page.subtitle")}>
      <div className="data-card">
        <div className="data-toolbar">
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
            {STATUS_TABS.map((s) => (
              <Tab key={s} label={t(`status.${s}`)} />
            ))}
          </Tabs>
          <TextField
            className="data-search"
            placeholder={t("all_ads_page.search_label")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {loading && <LinearProgress />}

        <Table className="data-table">
          <TableHead>
            <TableRow>
              <TableCell>{t("all_ads_page.table_title")}</TableCell>
              <TableCell>{t("all_ads_page.table_location")}</TableCell>
              <TableCell>{t("all_ads_page.table_price")}</TableCell>
              <TableCell>{t("all_ads_page.table_status")}</TableCell>
              <TableCell>{t("all_ads_page.table_views")}</TableCell>
              <TableCell>{t("all_ads_page.table_created")}</TableCell>
              <TableCell align="right">{t("all_ads_page.table_actions")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && ads.length === 0 && (
              <TableRow className="data-empty">
                <TableCell colSpan={7}>
                  <EmptyState compact icon={<CampaignOutlined />} title={t("all_ads_page.empty")} />
                </TableCell>
              </TableRow>
            )}

            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="cell-main">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                      className="cell-thumb"
                      src={ad.primary_image || AppConst.ADS_PLACEHOLDER_IMAGE}
                      alt=""
                      loading="lazy"
                    />
                    <div className="cell-title">
                      <Link to={`/ad/${ad.id}`}>{ad.title}</Link>
                      <span className="cell-sub">
                        {ad.category?.name}
                        {ad.sub_category ? ` / ${ad.sub_category}` : ""}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell data-label={t("all_ads_page.table_location")}>
                  {formatLocation(ad.city, ad.district)}
                </TableCell>
                <TableCell data-label={t("all_ads_page.table_price")}>
                  <strong>{formatPrice(ad.price)}</strong>
                </TableCell>
                <TableCell data-label={t("all_ads_page.table_status")}>
                  <StatusChip status={ad.status} />
                </TableCell>
                <TableCell data-label={t("all_ads_page.table_views")}>
                  {formatNumber(ad.views_count)}
                </TableCell>
                <TableCell data-label={t("all_ads_page.table_created")}>
                  {formatDate(ad.created_at, i18n.language)}
                </TableCell>
                <TableCell>
                  <div className="cell-actions">
                    <Tooltip title={t("all_ads_page.tooltip_view")}>
                      <IconButton component={Link} to={`/ad/${ad.id}`} className="icon-btn">
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {ad.status === "pending" && (
                      <Tooltip title={t("all_ads_page.tooltip_activate")}>
                        <span>
                          <IconButton
                            className="icon-btn success"
                            disabled={busy}
                            onClick={() =>
                              setStatus(
                                ad.id,
                                "active",
                                t("all_ads_page.activate_success"),
                                t("all_ads_page.activate_error"),
                              )
                            }
                          >
                            <CheckCircleOutline fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {["pending", "active"].includes(ad.status) && (
                      <Tooltip title={t("all_ads_page.tooltip_reject")}>
                        <IconButton
                          className="icon-btn danger"
                          onClick={() => setReject({ id: ad.id, reason: "", submitted: false })}
                        >
                          <BlockRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {ad.status === "active" && (
                      <ShareButton url={`${AppConst.FRONTEND_BASE_URL}ad/${ad.id}`} title={ad.title} />
                    )}

                    {ad.status !== "deleted" && (
                      <Tooltip title={t("all_ads_page.tooltip_delete")}>
                        <IconButton className="icon-btn danger" onClick={() => setDeleteId(ad.id)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_e, p) => setPage(p)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          labelRowsPerPage={t("common.rows_per_page")}
        />
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title={t("all_ads_page.dialog_title")}
        message={t("all_ads_page.dialog_message")}
        confirmLabel={t("all_ads_page.delete")}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        busy={busy}
      />

      <ConfirmDialog
        open={!!reject.id}
        title={t("all_ads_page.reject_modal_title")}
        message={t("all_ads_page.reject_modal_text")}
        confirmLabel={t("all_ads_page.reject_button")}
        onConfirm={handleReject}
        onClose={() => setReject({ id: null, reason: "", submitted: false })}
        busy={busy}
      >
        <TextField
          sx={{ mt: 2 }}
          label={t("all_ads_page.reject_reason")}
          multiline
          minRows={3}
          autoFocus
          value={reject.reason}
          onChange={(e) => setReject((r) => ({ ...r, reason: e.target.value }))}
          error={reasonError}
          helperText={
            reasonError ? t("all_ads_page.reject_reason_required") : t("all_ads_page.reject_reason_helper")
          }
        />
      </ConfirmDialog>
    </AdminLayout>
  );
};

export default AllAds;
