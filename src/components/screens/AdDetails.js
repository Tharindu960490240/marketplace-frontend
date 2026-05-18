import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { pink } from "@mui/material/colors";

import {
  Rating,
  Box,
  InputAdornment,
  TextField,
  Tooltip,
  IconButton,
  Avatar,
  Collapse,
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
import { ADS_PLACEHOLDER_IMAGE } from "../../const/const";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import * as AppConst from "../../const/const";

const getLabelText = (value) => {
  return `${value} Star${value !== 1 ? "s" : ""}, ${AppConst.RATING_LABLES[value]}`;
};

const AdDetails = () => {
  const { id } = useParams();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState("");
  const [clickSubmit, setClickSubmit] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);

  const [showReviews, setShowReviews] = useState(false);

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const fetchAd = useCallback(async () => {
    try {
      setLoading(true);
      setCurrentIndex(0);

      const token = await get_token();
      const myData = await getMyData();

      if (myData) {
        setUser(myData);
      }
      const res = await getAdById(id, token);

      if (res.success) {
        setAd(res.data);
        setIsSaved(res.data.is_saved);
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to load ad",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Server error while loading ad",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  const images = useMemo(() => {
    return ad?.images?.length > 0
      ? ad.images.map((img) => ADS_PLACEHOLDER_IMAGE + img.image_url)
      : [ADS_PLACEHOLDER_IMAGE + "uploads/profile_pic/user.png"];
  }, [ad]);

  const imageCount = images.length;

  useEffect(() => {
    if (imageCount <= 1 || paused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [imageCount, paused]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleSubmitReview = async () => {
    const token = await get_token();
    if (!token)
      return setSnackbar({
        open: true,
        message: "Session expired. Please login again.",
        severity: "error",
      });

    setClickSubmit(true);
    if (!rating || !comment.trim()) {
      setSnackbar({
        open: true,
        message: "Rating and comment are required",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await createReview(token, {
        ad_id: id,
        rating,
        comment,
      });

      if (res.success) {
        setSnackbar({
          open: true,
          message: "Review added successfully",
          severity: "success",
        });

        // RESET FORM
        setRating(0);
        setHover(-1);
        setComment("");
        setClickSubmit(false);
        fetchAd();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to add review",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Server error while submitting review",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const token = await get_token();
    if (!token)
      return setSnackbar({
        open: true,
        message: "Session expired. Please login again.",
        severity: "error",
      });

    try {
      setLoading(true);

      const res = await deleteReview(token, reviewId);

      if (res.success) {
        setSnackbar({
          open: true,
          message: "Review deleted successfully",
          severity: "success",
        });

        fetchAd(); // refresh reviews
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to delete review",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error deleting review",
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
        message: "Session expired. Please login again.",
        severity: "error",
      });
    }

    try {
      setLoading(true);

      let res;

      if (isSaved) {
        res = await removeSavedAd(token, id);
      } else {
        res = await saveAd(token, id);
      }

      if (res.success) {
        setIsSaved((prev) => !prev);
        window.dispatchEvent(new Event("savedChanged"));
        setSnackbar({
          open: true,
          message: isSaved ? "Removed from saved" : "Ad saved",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to update saved state",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Server error",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating) => {
    if (!rating) return "No rating";

    const rounded = Math.round(rating * 2) / 2;
    return AppConst.RATING_LABLES[rounded] || "No rating";
  };

  if (!ad) return <LoadingSpinner open={loading} />;

  return (
    <div className="ad-details-page">
      {/* ================= MAIN ================= */}
      <div className="ad-container">
        {/* LEFT */}
        <div className="ad-left">
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
                  className={`main-slider-img ${
                    index === currentIndex ? "active" : "inactive"
                  }`}
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

        {/* RIGHT */}
        <div className="ad-right">
          {isSaved && (
            <Bookmark className="saved-badge" sx={{ color: pink[500] }} />
          )}
          <h2>{ad.title}</h2>

          <p className="price">Rs. {ad.price}</p>

          <div className="meta">
            <span>{ad.city}</span>
            <span>{ad.district}</span>
          </div>

          <div className="rating-box">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Rating
                value={ad.avg_rating}
                precision={0.5}
                readOnly
                emptyIcon={
                  <Star style={{ opacity: 0.55 }} fontSize="inherit" />
                }
              />
              <span style={{ marginLeft: 8 }}>
                ({ad.avg_rating || 0} - {getRatingLabel(ad.avg_rating)})
              </span>
            </Box>
          </div>

          {/* SAVE */}

          <div className="button-group">
            <Tooltip title={isSaved ? "Remove from saved" : "Save ad"}>
              <button
                className={`wishlist-btn ${isSaved ? "active" : ""}`}
                onClick={handleToggleSave}
              >
                {isSaved ? (
                  <>
                    <Bookmark style={{ marginRight: 5 }} /> Saved
                  </>
                ) : (
                  <>
                    <BookmarkAdd style={{ marginRight: 5 }} />
                    Save
                  </>
                )}
              </button>
            </Tooltip>
          </div>

          {/* SELLER */}
          <div className="seller-card">
            <h4>Seller Information</h4>
            <p>{ad.user?.name}</p>
            <p>{ad.user?.phone}</p>
          </div>
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="description">
        <h3>Description</h3>
        <p>{ad.description}</p>
      </div>

      {/* ================= ADD REVIEW ================= */}
      {user?.role === "admin" && (
        <div className="review-box">
          <h3>Add Review</h3>

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
              {AppConst.RATING_LABLES[(hover !== -1 ? hover : rating) || 0]}
            </Box>
          </Box>
          <div className="form-row full">
            {/* DESCRIPTION */}
            <TextField
              className="custom-textfield"
              label="Review note"
              multiline
              rows={4}
              required
              value={comment}
              error={clickSubmit && !comment.trim()}
              helperText={
                clickSubmit && !comment
                  ? "Reason is required"
                  : "e.g. Good seller, fast response"
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
            Submit Review
          </button>
        </div>
      )}

      {/* ================= REVIEWS ================= */}

      <div className="reviews-section">
        <div className="reviews-header">
          <h3>Reviews</h3>
          <Tooltip title={showReviews ? "Hide Reviews" : "Show Reviews"}>
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
          {ad.reviews?.length === 0 ? (
            <p className="no-reviews">No reviews yet</p>
          ) : (
            ad.reviews?.map((rev) => (
              <div key={rev.id} className="review-card">
                <div className="review-header">
                  <div className="review-user">
                    <Avatar
                      src={
                        rev.user?.url
                          ? AppConst.PROFILE_PLACEHOLDER_IMAGE + rev.user.url
                          : AppConst.PROFILE_PLACEHOLDER_IMAGE +
                            "uploads/profile_pic/user.png"
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
                    <Tooltip title="Delete Review">
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
