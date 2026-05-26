import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { pink } from "@mui/material/colors";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import {
  Rating,
  Box,
  InputAdornment,
  TextField,
  Tooltip,
  IconButton,
  Avatar,
  Collapse,
  Chip,
} from "@mui/material";
import {
  Star,
  Description,
  Bookmark,
  BookmarkAdd,
  Delete,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

import "../styles/adDetails.css";

import { createReview, deleteReview } from "../../services/reviewService";
import { get_token, getMyData } from "../../services/authService";
import { getAdById } from "../../services/adsService";
import { saveAd, removeSavedAd } from "../../services/savedAdService";
import {
  ADS_PLACEHOLDER_IMAGE,
  PROFILE_PLACEHOLDER_IMAGE,
  RATING_LABLES,
} from "../../const/const";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";
import { useTranslation } from "react-i18next";

import * as AppConst from "../../const/const";

import ShareButton from "./ShareButton";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "250px",
  borderRadius: "8px",
};

const AdDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState("");
  const [clickSubmit, setClickSubmit] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [showReviews, setShowReviews] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const timerRef = useRef(null);

  const { isLoaded } = useJsApiLoader(AppConst.googleMapsConfig);

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const adCoordinates = useMemo(() => {
    if (ad?.latitude && ad?.longitude) {
      return {
        lat: parseFloat(ad.latitude),
        lng: parseFloat(ad.longitude),
      };
    }
    return null;
  }, [ad]);

  const fetchAd = useCallback(async () => {
    try {
      setRating(0);
      setHover(-1);
      setComment("");
      setClickSubmit(false);
      setLoading(true);
      setErrorOccurred(false);
      setCurrentIndex(0);

      const token = await get_token();
      const myData = await getMyData();

      if (myData) setUser(myData);

      const res = await getAdById(id, token);

      if (res.success) {
        setAd(res.data);
        setIsSaved(res.data.is_saved);
      } else {
        setErrorOccurred(true);
        setSnackbar({
          open: true,
          message: t("ad_details_page.failed_load_ad"),
          severity: "error",
        });
      }
    } catch (error) {
      setErrorOccurred(true);
      setSnackbar({
        open: true,
        message: t("ad_details_page.server_error_load_ad"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  const images = useMemo(() => {
    return ad?.images?.length > 0
      ? ad.images.map((img) => img.image_url)
      : [ADS_PLACEHOLDER_IMAGE];
  }, [ad]);

  const imageCount = images.length;

  // Clean implementation of auto slide interval controls
  const startTimer = useCallback(() => {
    if (imageCount <= 1 || paused) return;
    stopTimer();
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
    }, 4000);
  }, [imageCount, paused]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer]);

  const nextImage = () => {
    stopTimer();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    startTimer();
  };

  const prevImage = () => {
    stopTimer();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    startTimer();
  };

  const handleSubmitReview = async () => {
    const token = await get_token();
    if (!token) {
      return setSnackbar({
        open: true,
        message: t("ad_details_page.session_expired"),
        severity: "error",
      });
    }

    setClickSubmit(true);

    if (!rating || !comment.trim()) {
      return setSnackbar({
        open: true,
        message: t("ad_details_page.rating_comment_required"),
        severity: "error",
      });
    }

    try {
      setLoading(true);
      const res = await createReview(token, { ad_id: id, rating, comment });

      if (res.success) {
        setSnackbar({
          open: true,
          message: t("ad_details_page.review_added_success"),
          severity: "success",
        });
        setRating(0);
        setHover(-1);
        setComment("");
        setClickSubmit(false);
        fetchAd();
      } else {
        setSnackbar({
          open: true,
          message: t("ad_details_page.failed_add_review"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("ad_details_page.server_error_submit_review"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const token = await get_token();
    if (!token) {
      return setSnackbar({
        open: true,
        message: t("ad_details_page.session_expired"),
        severity: "error",
      });
    }

    try {
      setLoading(true);
      const res = await deleteReview(token, reviewId);

      if (res.success) {
        setSnackbar({
          open: true,
          message: t("ad_details_page.review_deleted_success"),
          severity: "success",
        });
        fetchAd();
      } else {
        setSnackbar({
          open: true,
          message: res.message || t("ad_details_page.failed_delete_review"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("ad_details_page.error_delete_review"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    const token = await get_token();
    if (!token) {
      return setSnackbar({
        open: true,
        message: t("ad_details_page.session_expired"),
        severity: "error",
      });
    }

    try {
      setLoading(true);
      const res = isSaved
        ? await removeSavedAd(token, id)
        : await saveAd(token, id);

      if (res.success) {
        setIsSaved((prev) => !prev);
        window.dispatchEvent(new Event("savedChanged"));
        setSnackbar({
          open: true,
          message: isSaved
            ? t("ad_details_page.removed_from_saved")
            : t("ad_details_page.ad_saved"),
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: t("ad_details_page.failed_update_saved"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("ad_details_page.server_error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLabelText = (value) => {
    return `${value} ${value !== 1 ? t("ad_details_page.stars") : t("ad_details_page.star")}, ${RATING_LABLES[value]}`;
  };

  const getRatingLabel = (ratingValue) => {
    if (!ratingValue) return t("ad_details_page.no_rating");
    const rounded = Math.round(ratingValue * 2) / 2;
    return RATING_LABLES[rounded] || t("ad_details_page.no_rating");
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
      active: t("ad_details_page.active"),
      pending: t("ad_details_page.pending"),
      sold: t("ad_details_page.sold"),
      rejected: t("ad_details_page.rejected"),
      deleted: t("ad_details_page.deleted"),
      Negotiable: t("ad_details_page.negotiable"),
      Fixed: t("ad_details_page.fixed"),
    };

    return (
      <Chip
        label={labelMap[status] || status}
        color={map[status]}
        size="small"
      />
    );
  };

  // Safe condition check guarding against empty states without freezing UI layout
  if (loading && !ad) return <LoadingSpinner open={loading} />;

  if (ad && user?.role !== "admin" && ad?.status !== "active") {
    const statusErrorMap = {
      pending: t("ad_details_page.status_error_pending"),
      sold: t("ad_details_page.status_error_sold"),
      rejected: t("ad_details_page.status_error_rejected"),
      deleted: t("ad_details_page.status_error_deleted"),
    };

    return (
      <div className="ad-details-page error-state">
        <p>
          {statusErrorMap[ad.status] || t("ad_details_page.failed_load_ad")}
        </p>
        <CustomSnackbar {...snackbar} onClose={handleClose} />
      </div>
    );
  }

  if (errorOccurred && !ad) {
    return (
      <div className="ad-details-page error-state">
        <p>{t("ad_details_page.failed_load_ad")}</p>
        <CustomSnackbar {...snackbar} onClose={handleClose} />
      </div>
    );
  }

  return (
    <div className="ad-details-page">
      <div className="ad-container">
        {/* LEFT PANEL */}
        <div className="ad-left">
          <span className="badge">{statusChip(ad?.status)}</span>
          <div
            className="slider"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="slider-inner">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`ad-${index}`}
                  className={`main-slider-img ${index === currentIndex ? "active" : "inactive"}`}
                />
              ))}
            </div>
            <button className="slider-btn left" onClick={prevImage}>
              &#10094;
            </button>
            <button className="slider-btn right" onClick={nextImage}>
              &#10095;
            </button>
            <div className="image-counter">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="ad-right">
          {isSaved && (
            <Bookmark className="saved-badge" sx={{ color: pink[500] }} />
          )}
          <h2>{ad?.title}</h2>
          <h3 style={{ marginBottom: 0 }}>{ad?.category?.name}</h3>
          {ad?.sub_category && <span>{ad.sub_category}</span>}

          <div className="price">
            Rs. {ad?.price}{" "}
            <span className="ad-pre">
              {statusChip(ad?.negotiable ? "Negotiable" : "Fixed")}
            </span>
          </div>

          <span className="location-tag">
            {ad?.city}, {ad?.district}
          </span>

          <div className="rating-box">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Rating
                value={ad?.avg_rating || 0}
                precision={0.5}
                readOnly
                emptyIcon={
                  <Star style={{ opacity: 0.55 }} fontSize="inherit" />
                }
              />
              <span style={{ marginLeft: 8 }}>
                ({ad?.avg_rating || 0} - {getRatingLabel(ad?.avg_rating)})
              </span>
            </Box>
          </div>

          <div className="button-group">
            {user?.role !== "admin" && user?.id !== ad?.user_id && (
              <Tooltip
                title={
                  isSaved
                    ? t("ad_details_page.remove_from_saved")
                    : t("ad_details_page.save_ad")
                }
              >
                <button
                  className={`wishlist-btn ${isSaved ? "active" : ""}`}
                  onClick={handleToggleSave}
                >
                  {isSaved ? (
                    <>
                      <Bookmark style={{ marginRight: 5 }} />
                      {t("ad_details_page.saved")}
                    </>
                  ) : (
                    <>
                      <BookmarkAdd style={{ marginRight: 5 }} />
                      {t("ad_details_page.save_ad")}
                    </>
                  )}
                </button>
              </Tooltip>
            )}
            {ad && (
              <ShareButton
                url={AppConst.FRONTEND_BASE_URL + "ad/" + ad.id}
                title={ad.title}
              />
            )}
          </div>

          <div className="seller-card">
            <h4>{t("ad_details_page.seller_information")}</h4>
            <p>{ad?.user?.name}</p>
            <p>{ad?.user?.phone}</p>
          </div>
        </div>
      </div>

      {adCoordinates && isLoaded && (
        <div className="card map-card">
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={adCoordinates}
            zoom={14}
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            <MarkerF position={adCoordinates} />
          </GoogleMap>
        </div>
      )}

      <div className="description">
        <h3>{t("ad_details_page.description")}</h3>
        <p>{ad?.description}</p>
      </div>

      {user?.role !== "admin" && user?.id !== ad?.user_id && (
        <div className="review-box">
          <h3>{t("ad_details_page.add_review")}</h3>
          <Box
            sx={{ mb: 2, width: 250, display: "flex", alignItems: "center" }}
          >
            <Rating
              name="hover-feedback"
              value={rating}
              precision={0.5}
              getLabelText={getLabelText}
              onChange={(e, newValue) => setRating(newValue)}
              onChangeActive={(e, newHover) => setHover(newHover)}
              emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
            <Box sx={{ ml: 2, fontSize: "inherit" }}>
              {RATING_LABLES[(hover !== -1 ? hover : rating) || 0]}
            </Box>
          </Box>
          <div className="form-row full">
            <TextField
              className="custom-textfield"
              label={t("ad_details_page.review_note")}
              multiline
              rows={4}
              required
              value={comment}
              error={clickSubmit && !comment.trim()}
              helperText={
                clickSubmit && !comment
                  ? t("ad_details_page.reason_required")
                  : t("ad_details_page.review_placeholder")
              }
              onChange={(e) => setComment(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <button className="button-success" onClick={handleSubmitReview}>
            {t("ad_details_page.submit_review")}
          </button>
        </div>
      )}

      <div className="reviews-section">
        <div className="reviews-header">
          <h3>{t("ad_details_page.reviews")}</h3>
          <Tooltip
            title={
              showReviews
                ? t("ad_details_page.hide_reviews")
                : t("ad_details_page.show_reviews")
            }
          >
            <IconButton
              color="primary"
              onClick={() => setShowReviews((prev) => !prev)}
            >
              {showReviews ? (
                <ExpandLess color="primary" />
              ) : (
                <ExpandMore color="primary" />
              )}
            </IconButton>
          </Tooltip>
        </div>

        <Collapse in={showReviews} timeout="auto" unmountOnExit>
          {ad?.reviews?.length === 0 ? (
            <p className="no-reviews">{t("ad_details_page.no_reviews")}</p>
          ) : (
            ad?.reviews?.map((rev) => (
              <div key={rev.id} className="review-card">
                <div className="review-header">
                  <div className="review-user">
                    <Avatar
                      src={
                        rev.user?.url ? rev.user.url : PROFILE_PLACEHOLDER_IMAGE
                      }
                    />
                    <div>
                      <strong>{rev.user?.name}</strong>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Rating
                          value={rev.rating}
                          precision={0.5}
                          readOnly
                          emptyIcon={
                            <Star
                              style={{ opacity: 0.55 }}
                              fontSize="inherit"
                            />
                          }
                        />
                        <span style={{ marginLeft: 8 }}>
                          ({rev.rating || 0} - {getRatingLabel(rev.rating)})
                        </span>
                      </Box>
                    </div>
                  </div>
                  {(user?.role === "admin" || rev.user?.id === user?.id) && (
                    <Tooltip title={t("ad_details_page.delete_review")}>
                      <IconButton onClick={() => handleDeleteReview(rev.id)}>
                        <Delete color="error" />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
                <p className="review-comment">{rev.comment}</p>
                <div className="review-date">
                  {new Date(rev.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </Collapse>
      </div>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default AdDetails;
