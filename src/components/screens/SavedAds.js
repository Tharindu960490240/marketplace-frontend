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

const SavedAds = () => {
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
          message: res.message || "Failed to load saved ads",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Server error while loading saved ads",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchSavedAds();
  }, [fetchSavedAds]);

  // ================= REMOVE (UNSAVE) =================
  const handleUnsave = async (adId) => {
    const token = await get_token();

    if (!token) {
      return setSnackbar({
        open: true,
        message: "Login required",
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
          message: "Removed from saved",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to remove",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Server error",
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
    if (!rating) return "No rating";

    const rounded = Math.round(rating * 2) / 2;
    return AppConst.RATING_LABLES[rounded] || "No rating";
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

    return <Chip label={status} color={map[status]} size="small" />;
  };

  return (
    <div className="marketplace">
      {/* ================= LIST ================= */}
      <section className="listings-container">
        <div className="listing-grid">
          {ads.length === 0 ? (
            <p className="no-data">No saved ads</p>
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
                      View Details
                    </button>

                    {/* 🔥 ALWAYS UNSAVE */}
                    <Tooltip title="Remove from saved">
                      <button
                        className="wishlist-btn active"
                        onClick={() => handleUnsave(item.id)}
                      >
                        <Bookmark style={{ marginRight: 5 }} />
                        Saved
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
