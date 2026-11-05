import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Button,
  InputAdornment,
  Pagination,
  Skeleton,
  TextField,
} from "@mui/material";
import {
  CategoryOutlined,
  LocationOnOutlined,
  SearchRounded,
  SearchOffRounded,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/home.css";

import * as AppConst from "../../const/const";
import { getAllCategories } from "../../services/categoryService";
import { getAds } from "../../services/adsService";
import { saveAd, removeSavedAd } from "../../services/savedAdService";
import { get_token } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../context/NotifyContext";
import useDebounce from "../../hooks/useDebounce";
import ListingCard from "../common/ListingCard";
import EmptyState from "../common/EmptyState";

const PAGE_SIZE = 24;

export const districtLabel = (d, lang) =>
  d ? (lang === "si" ? `${d.si} (${d.label})` : `${d.label} (${d.si})`) : "";

export const CardSkeletons = ({ count = 8 }) =>
  Array.from({ length: count }).map((_, i) => (
    <div className="listing-card skeleton" key={i} aria-hidden="true">
      <Skeleton variant="rectangular" sx={{ aspectRatio: "4 / 3", height: "auto" }} />
      <div className="listing-body">
        <Skeleton width="40%" />
        <Skeleton width="90%" />
        <Skeleton width="55%" height={30} />
        <Skeleton width="70%" />
      </div>
    </div>
  ));

const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const { user, isSignedIn, isAdmin } = useAuth();

  const [searchText, setSearchText] = useState("");
  const [district, setDistrict] = useState(null);
  const [category, setCategory] = useState(null);
  const [categoryList, setCategoryList] = useState([]);

  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savedMap, setSavedMap] = useState({});

  const debouncedSearch = useDebounce(searchText.trim(), 450);
  const requestId = useRef(0);

  /* ================= CATEGORIES (once) ================= */
  useEffect(() => {
    getAllCategories().then((res) => {
      if (res.success) setCategoryList(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  // New filters always start from page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, district, category]);

  /* ================= ADS ================= */
  const fetchAds = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);

    const token = await get_token();
    const res = await getAds(
      {
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        district,
        category_id: category?.id,
        status: "active",
      },
      token,
    );

    // Ignore responses from older searches
    if (id !== requestId.current) return;

    if (res.success) {
      setAds(res.data);
      setTotal(res.total);
      setSavedMap(Object.fromEntries(res.data.map((ad) => [ad.id, !!ad.is_saved])));
    } else {
      setAds([]);
      setTotal(0);
      notify(t("home_page.failed_load_ads"), "error");
    }
    setLoading(false);
  }, [page, debouncedSearch, district, category, notify, t, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  /* ================= SAVE ================= */
  const handleToggleSave = async (adId) => {
    const token = await get_token();
    if (!token) {
      notify(t("home_page.sign_in_to_save"), "info");
      navigate("/signin", { state: { from: "/home" } });
      return;
    }

    const wasSaved = !!savedMap[adId];
    setSavedMap((prev) => ({ ...prev, [adId]: !wasSaved })); // optimistic

    const res = wasSaved ? await removeSavedAd(token, adId) : await saveAd(token, adId);

    if (res.success) {
      window.dispatchEvent(new Event("savedChanged"));
      notify(wasSaved ? t("home_page.removed_saved") : t("home_page.ad_saved"));
    } else {
      setSavedMap((prev) => ({ ...prev, [adId]: wasSaved }));
      notify(res.message || t("home_page.failed_update_save"), "error");
    }
  };

  const hasFilters = !!(searchText || district || category);
  const clearFilters = () => {
    setSearchText("");
    setDistrict(null);
    setCategory(null);
  };

  const districts = AppConst.DISTRICTS;
  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="marketplace">
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-inner">
          <h1>{t("home_page.hero_title")}</h1>
          <p>{t("home_page.hero_description")}</p>

          <div className="search-bar" role="search">
            <TextField
              className="search-field search-keyword"
              placeholder={t("home_page.search_animals")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              inputProps={{ "aria-label": t("home_page.search_animals") }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded />
                  </InputAdornment>
                ),
              }}
            />

            <Autocomplete
              className="search-field"
              options={districts}
              value={districts.find((d) => d.value === district) || null}
              onChange={(_e, v) => setDistrict(v?.value || null)}
              getOptionLabel={(o) => districtLabel(o, i18n.language)}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t("home_page.location")}
                  inputProps={{ ...params.inputProps, "aria-label": t("home_page.location") }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnOutlined />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Autocomplete
              className="search-field"
              options={categoryList}
              value={category}
              onChange={(_e, v) => setCategory(v)}
              getOptionLabel={(o) => o?.name || ""}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t("home_page.category")}
                  inputProps={{ ...params.inputProps, "aria-label": t("home_page.category") }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryOutlined />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
        </div>
      </section>

      {/* ================= CATEGORY CHIPS ================= */}
      {categoryList.length > 0 && (
        <div className="category-strip" aria-label={t("home_page.category")}>
          <div className="category-strip-inner">
            <button
              className={`category-pill ${!category ? "active" : ""}`}
              onClick={() => setCategory(null)}
            >
              {t("home_page.all_categories")}
            </button>
            {categoryList.map((c) => (
              <button
                key={c.id}
                className={`category-pill ${category?.id === c.id ? "active" : ""}`}
                onClick={() => setCategory(category?.id === c.id ? null : c)}
                aria-pressed={category?.id === c.id}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= RESULTS ================= */}
      <section className="page results">
        <div className="results-head">
          <h2>
            {loading
              ? t("home_page.searching")
              : t("home_page.results_count", { count: total })}
          </h2>
          {hasFilters && (
            <Button size="small" onClick={clearFilters}>
              {t("home_page.clear_filters")}
            </Button>
          )}
        </div>

        <div className="listing-grid">
          {loading && <CardSkeletons />}

          {!loading &&
            ads.map((ad) => (
              <ListingCard
                key={ad.id}
                ad={ad}
                saved={savedMap[ad.id]}
                canSave={!isAdmin && user?.id !== ad.user_id}
                onToggleSave={handleToggleSave}
              />
            ))}
        </div>

        {!loading && ads.length === 0 && (
          <EmptyState
            icon={<SearchOffRounded />}
            title={t("home_page.no_listings_found")}
            text={t("home_page.no_listings_hint")}
            action={
              hasFilters && (
                <Button variant="outlined" onClick={clearFilters}>
                  {t("home_page.clear_filters")}
                </Button>
              )
            }
          />
        )}

        {pageCount > 1 && (
          <div className="pagination-bar">
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_e, p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              color="primary"
              shape="rounded"
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
