import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  IconButton,
  Rating,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  ArrowBackRounded,
  Bookmark,
  BookmarkBorder,
  CalendarTodayOutlined,
  ChevronLeftRounded,
  ChevronRightRounded,
  DeleteOutline,
  ErrorOutlineRounded,
  LocationOnOutlined,
  PhoneOutlined,
  RateReviewOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/adDetails.css";

import * as AppConst from "../../const/const";
import { createReview, deleteReview } from "../../services/reviewService";
import { get_token } from "../../services/authService";
import { getAdById } from "../../services/adsService";
import { saveAd, removeSavedAd } from "../../services/savedAdService";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotifyContext";
import {
  formatDate,
  formatPrice,
  formatRating,
  getRatingLabel,
  formatLocation,
} from "../../utils/format";
import ShareButton from "./ShareButton";
import StatusChip from "../common/StatusChip";
import PageLoader from "../common/PageLoader";
import EmptyState from "../common/EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";

const AdDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const { user, isSignedIn, isAdmin } = useAuth();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [imageIndex, setImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  /* ================= LOAD ================= */
  const fetchAd = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setFailed(false);

      const token = await get_token();
      const res = await getAdById(id, token);

      if (res.success && res.data) {
        setAd(res.data);
        setIsSaved(!!res.data.is_saved);
      } else {
        setFailed(true);
      }
      setLoading(false);
    },
    [id],
  );

  useEffect(() => {
    setImageIndex(0);
    fetchAd();
  }, [fetchAd]);

  const images = useMemo(() => {
    const list = (ad?.images || []).map((img) => img.image_url).filter(Boolean);
    return list.length ? list : [AppConst.ADS_PLACEHOLDER_IMAGE];
  }, [ad]);

  const step = (dir) =>
    setImageIndex((i) => (i + dir + images.length) % images.length);

  const isOwner = !!user && user.id === ad?.user_id;
  const canInteract = !isAdmin && !isOwner; // save + review

  /* ================= SAVE ================= */
  const handleToggleSave = async () => {
    const token = await get_token();
    if (!token) {
      notify(t("home_page.sign_in_to_save"), "info");
      navigate("/signin", { state: { from: `/ad/${id}` } });
      return;
    }

    const was = isSaved;
    setIsSaved(!was);
    const res = was ? await removeSavedAd(token, id) : await saveAd(token, id);

    if (res.success) {
      window.dispatchEvent(new Event("savedChanged"));
      notify(was ? t("ad_details_page.removed_from_saved") : t("ad_details_page.ad_saved"));
    } else {
      setIsSaved(was);
      notify(t("ad_details_page.failed_update_saved"), "error");
    }
  };

  /* ================= REVIEWS ================= */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitted(true);

    if (!rating || !comment.trim()) {
      notify(t("ad_details_page.rating_comment_required"), "error");
      return;
    }

    setBusy(true);
    const token = await get_token();
    const res = await createReview(token, {
      ad_id: id,
      rating,
      comment: comment.trim(),
    });
    setBusy(false);

    if (res.success) {
      notify(t("ad_details_page.review_added_success"));
      setRating(0);
      setComment("");
      setReviewSubmitted(false);
      fetchAd({ silent: true });
    } else {
      notify(res.message || t("ad_details_page.failed_add_review"), "error");
    }
  };

  const handleDeleteReview = async () => {
    setBusy(true);
    const token = await get_token();
    const res = await deleteReview(token, deleteId);
    setBusy(false);
    setDeleteId(null);

    if (res.success) {
      notify(t("ad_details_page.review_deleted_success"));
      fetchAd({ silent: true });
    } else {
      notify(res.message || t("ad_details_page.failed_delete_review"), "error");
    }
  };

  /* ================= STATES ================= */
  if (loading) return <PageLoader minHeight="60vh" />;

  if (failed || !ad) {
    return (
      <div className="page narrow">
        <EmptyState
          icon={<ErrorOutlineRounded />}
          title={t("ad_details_page.failed_load_ad")}
          text={t("ad_details_page.not_found_hint")}
          action={
            <Button component={Link} to="/home" variant="contained">
              {t("header.browse")}
            </Button>
          }
        />
      </div>
    );
  }

  const reviews = ad.reviews || [];
  const commentError = reviewSubmitted && !comment.trim();
  const shownLabel = getRatingLabel(t, hover !== -1 ? hover : rating);

  return (
    <div className="page ad-page">
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowBackRounded fontSize="small" />
        {t("common.back")}
      </button>

      <div className="ad-layout">
        {/* ================= GALLERY ================= */}
        <section className="ad-gallery" aria-label={t("ad_details_page.photos")}>
          <div className="gallery-main">
            <img
              src={images[imageIndex]}
              alt={`${ad.title} ${imageIndex + 1}`}
              onError={(e) => {
                e.currentTarget.src = AppConst.ADS_PLACEHOLDER_IMAGE;
              }}
            />
            {images.length > 1 && (
              <>
                <IconButton
                  className="gallery-nav prev"
                  onClick={() => step(-1)}
                  aria-label={t("ad_details_page.previous_photo")}
                >
                  <ChevronLeftRounded />
                </IconButton>
                <IconButton
                  className="gallery-nav next"
                  onClick={() => step(1)}
                  aria-label={t("ad_details_page.next_photo")}
                >
                  <ChevronRightRounded />
                </IconButton>
                <span className="gallery-count">
                  {imageIndex + 1} / {images.length}
                </span>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  className={`gallery-thumb ${i === imageIndex ? "active" : ""}`}
                  onClick={() => setImageIndex(i)}
                  aria-label={`${t("ad_details_page.photo")} ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ================= SUMMARY ================= */}
        <aside className="ad-summary">
          <div className="panel ad-summary-card">
            <div className="ad-summary-top">
              <span className="ad-category">
                {ad.category?.name}
                {ad.sub_category ? ` / ${ad.sub_category}` : ""}
              </span>
              {ad.status !== "active" && <StatusChip status={ad.status} />}
            </div>

            <h1 className="ad-title">{ad.title}</h1>

            <div className="ad-price-row">
              <span className="ad-price">{formatPrice(ad.price)}</span>
              <span className={`price-tag ${ad.negotiable ? "is-negotiable" : ""}`}>
                {ad.negotiable ? t("home_page.negotiable") : t("home_page.fixed")}
              </span>
            </div>

            <ul className="ad-facts">
              <li>
                <LocationOnOutlined fontSize="small" />
                {formatLocation(ad.city, ad.district)}
              </li>
              <li>
                <VisibilityOutlined fontSize="small" />
                {t("ad_details_page.views_count", { count: Number(ad.views_count) || 0 })}
              </li>
              {ad.created_at && (
                <li>
                  <CalendarTodayOutlined fontSize="small" />
                  {t("ad_details_page.posted_on", {
                    date: formatDate(ad.created_at, i18n.language),
                  })}
                </li>
              )}
            </ul>

            <div className="ad-rating-line">
              <Rating value={Number(ad.avg_rating) || 0} precision={0.5} readOnly size="small" />
              <strong>{formatRating(ad.avg_rating)}</strong>
              <span>{getRatingLabel(t, ad.avg_rating)}</span>
              <span>({t("ad_details_page.review_count", { count: reviews.length })})</span>
            </div>

            <div className="ad-actions">
              {ad.user?.phone && (
                <Button
                  variant="contained"
                  size="large"
                  href={`tel:${ad.user.phone}`}
                  startIcon={<PhoneOutlined />}
                  fullWidth
                >
                  {t("ad_details_page.call_seller")}
                </Button>
              )}
              <div className="ad-actions-row">
                {canInteract && (
                  <Button
                    variant="outlined"
                    onClick={handleToggleSave}
                    startIcon={isSaved ? <Bookmark /> : <BookmarkBorder />}
                    fullWidth
                  >
                    {isSaved ? t("ad_details_page.saved") : t("ad_details_page.save_ad")}
                  </Button>
                )}
                <ShareButton url={`${AppConst.FRONTEND_BASE_URL}ad/${ad.id}`} title={ad.title} />
              </div>
            </div>
          </div>

          <div className="panel seller-card">
            <h2 className="panel-title">{t("ad_details_page.seller_information")}</h2>
            <div className="seller-row">
              <Avatar src={ad.user?.profile_image || AppConst.PROFILE_PLACEHOLDER_IMAGE} />
              <div>
                <strong>{ad.user?.name}</strong>
                {ad.user?.phone && <a href={`tel:${ad.user.phone}`}>{ad.user.phone}</a>}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <section className="panel ad-section">
        <h2 className="panel-title">{t("ad_details_page.description")}</h2>
        <p className="ad-description">{ad.description}</p>
      </section>

      {/* ================= REVIEWS ================= */}
      <section className="panel ad-section">
        <div className="reviews-head">
          <h2 className="panel-title">
            {t("ad_details_page.reviews")} ({reviews.length})
          </h2>
        </div>

        {canInteract && isSignedIn && (
          <form className="review-form" onSubmit={handleSubmitReview} noValidate>
            <div className="review-rating-input">
              <span>{t("ad_details_page.your_rating")}</span>
              <Rating
                value={rating}
                precision={0.5}
                onChange={(_e, v) => setRating(v || 0)}
                onChangeActive={(_e, v) => setHover(v)}
                size="large"
              />
              <span className="review-rating-label">{(hover !== -1 || rating) ? shownLabel : ""}</span>
            </div>
            <TextField
              label={t("ad_details_page.review_note")}
              placeholder={t("ad_details_page.review_placeholder")}
              multiline
              minRows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              error={commentError}
              helperText={commentError ? t("ad_details_page.comment_required") : ""}
              inputProps={{ maxLength: 1000 }}
            />
            <div className="form-actions">
              <Button type="submit" variant="contained" disabled={busy}>
                {t("ad_details_page.submit_review")}
              </Button>
            </div>
          </form>
        )}

        {!isSignedIn && (
          <p className="review-signin">
            <Link to="/signin" state={{ from: `/ad/${id}` }} className="text-link">
              {t("signin_page.signIn")}
            </Link>{" "}
            {t("ad_details_page.sign_in_to_review")}
          </p>
        )}

        {reviews.length === 0 ? (
          <EmptyState
            compact
            icon={<RateReviewOutlined />}
            title={t("ad_details_page.no_reviews")}
          />
        ) : (
          <ul className="review-list">
            {reviews.map((rev) => (
              <li key={rev.id} className="review-item">
                <Avatar
                  src={rev.user?.url || rev.user?.profile_image || AppConst.PROFILE_PLACEHOLDER_IMAGE}
                />
                <div className="review-content">
                  <div className="review-top">
                    <strong>{rev.user?.name}</strong>
                    <span className="review-date">
                      {formatDate(rev.created_at, i18n.language)}
                    </span>
                  </div>
                  <div className="review-stars">
                    <Rating value={Number(rev.rating) || 0} precision={0.5} readOnly size="small" />
                    <span>{getRatingLabel(t, rev.rating)}</span>
                  </div>
                  <p>{rev.comment}</p>
                </div>
                {(isAdmin || rev.user?.id === user?.id) && (
                  <Tooltip title={t("ad_details_page.delete_review")}>
                    <IconButton
                      className="icon-btn"
                      onClick={() => setDeleteId(rev.id)}
                      aria-label={t("ad_details_page.delete_review")}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={!!deleteId}
        title={t("ad_details_page.delete_review")}
        message={t("ad_details_page.delete_review_confirm")}
        confirmLabel={t("common.delete")}
        onConfirm={handleDeleteReview}
        onClose={() => setDeleteId(null)}
        busy={busy}
      />
    </div>
  );
};

export default AdDetails;
