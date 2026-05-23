import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { pink } from "@mui/material/colors";
import { TablePagination, Rating, Box, Tooltip, Chip } from "@mui/material";

import { Bookmark, Star } from "@mui/icons-material";

import * as AppConst from "../../const/const";
import "../styles/home.css";

import { getSavedAds, removeSavedAd } from "../../services/savedAdService";
import { incrementAdView } from "../../services/adsService";
import { get_token } from "../../services/authService";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { useTranslation } from "react-i18next";

const SavedAds = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [ads, setAds] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ================= FETCH SAVED ADS =================
  const fetchSavedAds = useCallback(async () => {
    try {
      const token = await get_token();
      setLoading(true);

      const res = await getSavedAds(token, {
        page: page + 1,
        limit: rowsPerPage,
      });

      if (res?.success) {
        setAds(res.data || []);
        setTotal(res.total || 0);
      } else {
        setSnackbar({
          open: true,
          message: res.message || t("saved_ads_page.failed_load_saved_ads"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("saved_ads_page.server_error_loading_saved_ads"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, t]);

  useEffect(() => {
    fetchSavedAds();
  }, [fetchSavedAds]);

  // ================= REMOVE (UNSAVE) =================
  const handleUnsave = async (adId) => {
    const token = await get_token();

    if (!token) {
      return setSnackbar({
        open: true,
        message: t("saved_ads_page.session_expired"),
        severity: "error",
      });
    }

    try {
      const res = await removeSavedAd(token, adId);

      if (res.success) {
        setAds((prev) => prev.filter((ad) => ad.id !== adId));
        setTotal((prev) => prev - 1);
        window.dispatchEvent(new Event("savedChanged"));
        setSnackbar({
          open: true,
          message: t("saved_ads_page.removed_saved"),
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: t("saved_ads_page.failed_remove"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("saved_ads_page.server_error"),
        severity: "error",
      });
    }
  };

  const incrementViews = async (id) => {
    try {
      await incrementAdView(id);
    } catch {}
  };

  const getRatingLabel = (rating) => {
    if (!rating) return t("saved_ads_page.no_rating");

    const rounded = Math.round(rating * 2) / 2;
    return AppConst.RATING_LABLES[rounded] || t("saved_ads_page.no_rating");
  };

  const statusChip = (status) => {
    const map = {
      active: "success",
      pending: "warning",
      sold: "error",
      rejected: "error",
      deleted: "error",
      Negotiable: "warning",
      Fixed: "warning",
    };

    const labelMap = {
      active: t("saved_ads_page.active"),
      pending: t("saved_ads_page.pending"),
      sold: t("saved_ads_page.sold"),
      rejected: t("saved_ads_page.rejected"),
      deleted: t("saved_ads_page.deleted"),
      Negotiable: t("saved_ads_page.negotiable"),
      Fixed: t("saved_ads_page.fixed"),
    };

    return (
      <Chip
        label={labelMap[status] || status}
        color={map[status]}
        size="small"
      />
    );
  };

  return (
    <div className="marketplace">
      {/* ================= LIST ================= */}
      <section className="listings-container">
        <div className="listing-grid">
          {ads.length === 0 ? (
            <p className="no-data">{t("saved_ads_page.no_saved_ads")}</p>
          ) : (
            ads.map((item) => (
              <div className="listing-card modern" key={item.id}>
                {/* IMAGE */}
                <div className="img">
                  <img
                    src={
                      item.primary_image
                        ? item.primary_image
                        : AppConst.ADS_PLACEHOLDER_IMAGE
                    }
                    alt={item.title}
                  />
                  <span className="badge">{statusChip(item.status)}</span>
                  <Bookmark className="saved-badge" sx={{ color: pink[500] }} />
                </div>

                {/* INFO */}
                <div className="info">
                  <div className="card-header">
                    <h3>{item.title}</h3>

                    <span className="location-tag">
                      {item.city}, {item.district}
                    </span>
                  </div>

                  <p>{item.sub_category}</p>

                  <div className="price-row">
                    <span className="price">Rs. {item.price}</span>
                    <span className="per">
                      {statusChip(item.negotiable ? "Negotiable" : "Fixed")}
                    </span>
                  </div>

                  <div className="rating-row">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Rating
                        value={item.avg_rating}
                        precision={0.5}
                        readOnly
                        emptyIcon={
                          <Star style={{ opacity: 0.55 }} fontSize="inherit" />
                        }
                      />
                      <span style={{ marginLeft: 8 }}>
                        ({item.avg_rating || 0} -{" "}
                        {getRatingLabel(item.avg_rating)})
                      </span>
                    </Box>
                  </div>

                  <div className="button-group">
                    <button
                      className="button-success"
                      onClick={async () => {
                        await incrementViews(item.id);
                        navigate(`/ad/${item.id}`);
                      }}
                    >
                      {t("saved_ads_page.view_details")}
                    </button>

                    {/* 🔥 ALWAYS UNSAVE */}
                    <Tooltip title={t("saved_ads_page.remove_saved")}>
                      <button
                        className="wishlist-btn active"
                        onClick={() => handleUnsave(item.id)}
                      >
                        <Bookmark style={{ marginRight: 5 }} />
                        {t("saved_ads_page.saved")}
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ================= PAGINATION ================= */}
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default SavedAds;
