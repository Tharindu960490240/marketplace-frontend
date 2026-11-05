import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Pagination } from "@mui/material";
import { BookmarkBorder } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/home.css";

import { getSavedAds, removeSavedAd } from "../../services/savedAdService";
import { get_token } from "../../services/authService";
import { useNotify } from "../../context/NotifyContext";
import ListingCard from "../common/ListingCard";
import EmptyState from "../common/EmptyState";
import { CardSkeletons } from "./Home";

const PAGE_SIZE = 12;

const SavedAds = () => {
  const { t } = useTranslation();
  const notify = useNotify();

  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchSavedAds = useCallback(async () => {
    setLoading(true);
    const token = await get_token();
    const res = await getSavedAds(token, { page, limit: PAGE_SIZE });

    if (res.success) {
      setAds(res.data);
      setTotal(res.total);
    } else {
      notify(t("saved_ads_page.failed_load_saved_ads"), "error");
    }
    setLoading(false);
  }, [page, notify, t]);

  useEffect(() => {
    fetchSavedAds();
  }, [fetchSavedAds]);

  const handleUnsave = async (adId) => {
    const token = await get_token();
    const res = await removeSavedAd(token, adId);

    if (!res.success) {
      notify(t("saved_ads_page.failed_remove"), "error");
      return;
    }

    window.dispatchEvent(new Event("savedChanged"));
    notify(t("saved_ads_page.removed_saved"));

    // Removing the last card on a page moves back one page
    if (ads.length === 1 && page > 1) setPage((p) => p - 1);
    else fetchSavedAds();
  };

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("header.mySavedAds")}</h1>
          <p className="page-subtitle">
            {t("saved_ads_page.subtitle", { count: total })}
          </p>
        </div>
      </div>

      <div className="listing-grid">
        {loading && <CardSkeletons count={4} />}
        {!loading &&
          ads.map((ad) => (
            <ListingCard
              key={ad.id}
              ad={ad}
              saved
              canSave
              showStatus
              onToggleSave={handleUnsave}
            />
          ))}
      </div>

      {!loading && ads.length === 0 && (
        <EmptyState
          icon={<BookmarkBorder />}
          title={t("saved_ads_page.no_saved_ads")}
          text={t("saved_ads_page.empty_hint")}
          action={
            <Button component={Link} to="/home" variant="contained">
              {t("header.browse")}
            </Button>
          }
        />
      )}

      {pageCount > 1 && (
        <div className="pagination-bar">
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_e, p) => setPage(p)}
            color="primary"
            shape="rounded"
          />
        </div>
      )}
    </div>
  );
};

export default SavedAds;
