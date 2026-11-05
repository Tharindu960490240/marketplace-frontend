import React from "react";
import { Link } from "react-router-dom";
import { IconButton, Rating, Tooltip } from "@mui/material";
import {
  Bookmark,
  BookmarkBorder,
  LocationOnOutlined,
  StarRounded,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import * as AppConst from "../../const/const";
import { incrementAdView } from "../../services/adsService";
import { formatLocation, formatNumber, formatPrice, formatRating } from "../../utils/format";
import ShareButton from "../screens/ShareButton";
import StatusChip from "./StatusChip";

/* Shared ad card used by Home and Saved Ads. */
const ListingCard = ({ ad, saved, canSave, onToggleSave, showStatus = false }) => {
  const { t } = useTranslation();
  const image = ad.primary_image || AppConst.ADS_PLACEHOLDER_IMAGE;

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSave?.(ad.id);
  };

  return (
    <Link
      to={`/ad/${ad.id}`}
      className="listing-card"
      onClick={() => incrementAdView(ad.id)}
    >
      <div className="listing-media">
        <img
          src={image}
          alt={ad.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = AppConst.ADS_PLACEHOLDER_IMAGE;
          }}
        />
        {showStatus && ad.status !== "active" && (
          <StatusChip status={ad.status} className="listing-status" />
        )}
        {canSave && (
          <Tooltip title={saved ? t("home_page.remove_saved") : t("home_page.save_ad")}>
            <IconButton
              className={`listing-save ${saved ? "is-saved" : ""}`}
              onClick={handleSave}
              aria-pressed={!!saved}
              aria-label={saved ? t("home_page.remove_saved") : t("home_page.save_ad")}
              size="small"
            >
              {saved ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </div>

      <div className="listing-body">
        <div className="listing-category">
          {ad.category?.name}
          {ad.sub_category ? ` / ${ad.sub_category}` : ""}
        </div>

        <h3 className="listing-title">{ad.title}</h3>

        <div className="listing-price-row">
          <span className="listing-price">{formatPrice(ad.price)}</span>
          <span className={`price-tag ${ad.negotiable ? "is-negotiable" : ""}`}>
            {ad.negotiable ? t("home_page.negotiable") : t("home_page.fixed")}
          </span>
        </div>

        <div className="listing-location">
          <LocationOnOutlined fontSize="inherit" />
          <span>
            {formatLocation(ad.city, ad.district)}
          </span>
        </div>

        <div className="listing-footer">
          <div className="listing-rating" title={t("home_page.rating")}>
            <Rating value={Number(ad.avg_rating) || 0} precision={0.5} readOnly size="small" />
            <StarRounded className="rating-star-compact" fontSize="inherit" />
            <span>{formatRating(ad.avg_rating)}</span>
          </div>
          <div className="listing-meta">
            <span className="listing-views">
              <VisibilityOutlined fontSize="inherit" />
              {formatNumber(ad.views_count)}
            </span>
            <ShareButton
              url={`${AppConst.FRONTEND_BASE_URL}ad/${ad.id}`}
              title={ad.title}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
