import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
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
  AddRounded,
  CampaignOutlined,
  CheckCircleOutline,
  DeleteOutline,
  ReplayRounded,
  SearchRounded,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/dataTable.css";

import * as AppConst from "../../const/const";
import { getMyAds, updateAdStatus } from "../../services/adsService";
import { get_token } from "../../services/authService";
import { useNotify } from "../../context/NotifyContext";
import useDebounce from "../../hooks/useDebounce";
import { formatNumber, formatPrice } from "../../utils/format";
import StatusChip from "../common/StatusChip";
import EmptyState from "../common/EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";
import ShareButton from "./ShareButton";

const STATUS_TABS = ["active", "pending", "sold", "rejected", "deleted"];

const MyAds = () => {
  const { t } = useTranslation();
  const notify = useNotify();

  const [tab, setTab] = useState(0);
  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 450);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => setPage(0), [debouncedSearch, tab, rowsPerPage]);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    const token = await get_token();
    const res = await getMyAds(
      { page: page + 1, limit: rowsPerPage, search: debouncedSearch, status: STATUS_TABS[tab] },
      token,
    );
    if (res.success) {
      setAds(res.data);
      setTotal(res.total);
    } else {
      notify(t("my_ads_page.load_error"), "error");
    }
    setLoading(false);
  }, [page, rowsPerPage, debouncedSearch, tab, notify, t]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const changeStatus = async (id, status, message) => {
    setBusyId(id);
    const token = await get_token();
    const res = await updateAdStatus(token, id, status);
    setBusyId(null);

    if (res.success) {
      notify(message);
      fetchAds();
    } else {
      notify(res.message || t("my_ads_page.update_error"), "error");
    }
  };

  const handleDelete = async () => {
    const id = deleteId;
    setDeleteId(null);
    await changeStatus(id, "deleted", t("my_ads_page.delete_success"));
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("my_ads_page.title")}</h1>
          <p className="page-subtitle">{t("my_ads_page.subtitle")}</p>
        </div>
        <Button component={Link} to="/post-ad" variant="contained" startIcon={<AddRounded />}>
          {t("header.postAd")}
        </Button>
      </div>

      <div className="data-card">
        <div className="data-toolbar">
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            {STATUS_TABS.map((s) => (
              <Tab key={s} label={t(`status.${s}`)} />
            ))}
          </Tabs>
          <TextField
            className="data-search"
            placeholder={t("my_ads_page.search_label")}
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
              <TableCell>{t("my_ads_page.table_title")}</TableCell>
              <TableCell>{t("my_ads_page.table_status")}</TableCell>
              <TableCell>{t("my_ads_page.table_price")}</TableCell>
              <TableCell>{t("my_ads_page.table_views")}</TableCell>
              <TableCell align="right">{t("my_ads_page.table_actions")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && ads.length === 0 && (
              <TableRow className="data-empty">
                <TableCell colSpan={5}>
                  <EmptyState
                    compact
                    icon={<CampaignOutlined />}
                    title={t("my_ads_page.empty")}
                    text={t("my_ads_page.empty_hint")}
                  />
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
                      {ad.status === "rejected" && (ad.reason || ad.reject_reason) && (
                        <span className="cell-note">
                          {t("my_ads_page.rejected_reason", {
                            reason: ad.reason || ad.reject_reason,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell data-label={t("my_ads_page.table_status")}>
                  <StatusChip status={ad.status} />
                </TableCell>
                <TableCell data-label={t("my_ads_page.table_price")}>
                  <strong>{formatPrice(ad.price)}</strong>
                </TableCell>
                <TableCell data-label={t("my_ads_page.table_views")}>
                  {formatNumber(ad.views_count)}
                </TableCell>
                <TableCell>
                  <div className="cell-actions">
                    <Tooltip title={t("my_ads_page.tooltip_view")}>
                      <IconButton component={Link} to={`/ad/${ad.id}`} className="icon-btn">
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {ad.status === "active" && (
                      <Tooltip title={t("my_ads_page.tooltip_mark_sold")}>
                        <span>
                          <IconButton
                            className="icon-btn success"
                            disabled={busyId === ad.id}
                            onClick={() =>
                              changeStatus(ad.id, "sold", t("my_ads_page.marked_sold"))
                            }
                          >
                            <CheckCircleOutline fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {ad.status === "sold" && (
                      <Tooltip title={t("my_ads_page.tooltip_mark_active")}>
                        <span>
                          <IconButton
                            className="icon-btn"
                            disabled={busyId === ad.id}
                            onClick={() =>
                              changeStatus(ad.id, "active", t("my_ads_page.marked_active"))
                            }
                          >
                            <ReplayRounded fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {ad.status === "active" && (
                      <ShareButton
                        url={`${AppConst.FRONTEND_BASE_URL}ad/${ad.id}`}
                        title={ad.title}
                      />
                    )}

                    {["pending", "active", "sold"].includes(ad.status) && (
                      <Tooltip title={t("my_ads_page.tooltip_delete")}>
                        <span>
                          <IconButton
                            className="icon-btn danger"
                            disabled={busyId === ad.id}
                            onClick={() => setDeleteId(ad.id)}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </span>
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
        title={t("my_ads_page.dialog_title")}
        message={t("my_ads_page.dialog_message")}
        confirmLabel={t("my_ads_page.delete")}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};

export default MyAds;
