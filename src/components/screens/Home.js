import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pink } from "@mui/material/colors";

import {
  Autocomplete,
  TablePagination,
  TextField,
  InputAdornment,
  Rating,
  Box,
  Tooltip,
  Chip,
} from "@mui/material";

import {
  Search,
  Category,
  LocationOn,
  Bookmark,
  Star,
  BookmarkAdd,
} from "@mui/icons-material";

import * as AppConst from "../../const/const";
import "../styles/home.css";

import { getAllCategories } from "../../services/categoryService";
import { getAds, incrementAdView } from "../../services/adsService";
import { saveAd, removeSavedAd } from "../../services/savedAdService";

import { get_token, getMyData } from "../../services/authService";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState(null);
  const [categoryList, setCategoryList] = useState([]);

  const [ads, setAds] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [savedMap, setSavedMap] = useState({});

  const [user, setUser] = useState(null);

  // ================= DISTRICTS =================
  const districts = AppConst.DISTRICTS;

  // ================= FETCH CATEGORIES =================
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const myData = await getMyData();

      if (myData) {
        setUser(myData);
      }

      const res = await getAllCategories();
      if (res?.success) {
        setCategoryList(res.data || []);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("home_page.error_loading_categories"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchAds = useCallback(async () => {
    try {
      const token = await get_token();
      setLoading(true);

      const res = await getAds(
        {
          page: page + 1,
          limit: rowsPerPage,
          search: searchText,
          district: location,
          category_id: category?.id,
          status: "active",
        },
        token,
      );

      if (res?.success) {
        setAds(res.data || []);
        setTotal(res.total || 0);

        // build saved map
        const map = {};
        (res.data || []).forEach((ad) => {
          map[ad.id] = ad.is_saved;
        });

        setSavedMap(map);
      } else {
        setSnackbar({
          open: true,
          message: res.message || t("home_page.failed_load_ads"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("home_page.server_error_loading_ads"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchText, location, category?.id, t]);

  useEffect(() => {
    fetchCategories();
    fetchAds();
  }, [fetchCategories, fetchAds]);

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const incrementViews = async (id) => {
    try {
      const res = await incrementAdView(id);

      if (!res.success) {
        setSnackbar({
          open: true,
          message: t("home_page.failed_update_views"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("home_page.server_error"),
        severity: "error",
      });
    }
  };

  const handleToggleSave = async (adId) => {
    const token = await get_token();

    if (!token) {
      return setSnackbar({
        open: true,
        message: t("home_page.session_expired"),
        severity: "error",
      });
    }

    try {
      const isSaved = savedMap[adId];

      let res;

      if (isSaved) {
        res = await removeSavedAd(token, adId);
      } else {
        res = await saveAd(token, adId);
      }

      if (res.success) {
        setSavedMap((prev) => ({
          ...prev,
          [adId]: !isSaved,
        }));
        window.dispatchEvent(new Event("savedChanged"));
        setSnackbar({
          open: true,
          message: isSaved
            ? t("home_page.removed_saved")
            : t("home_page.ad_saved"),
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.message || t("home_page.failed_update_save"),
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: t("home_page.server_error"),
        severity: "error",
      });
    }
  };

  const getRatingLabel = (rating) => {
    if (!rating) return t("home_page.no_rating");

    const rounded = Math.round(rating * 2) / 2;
    return AppConst.RATING_LABLES[rounded] || t("home_page.no_rating");
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
      active: t("home_page.active"),
      pending: t("home_page.pending"),
      sold: t("home_page.sold"),
      rejected: t("home_page.rejected"),
      deleted: t("home_page.deleted"),
      Negotiable: t("home_page.negotiable"),
      Fixed: t("home_page.fixed"),
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
      {/* ================= HERO ================= */}
      <section className="hero-search">
        <div className="container">
          <div className="hero-content">
            <h1>{t("home_page.hero_title")}</h1>
            <p>{t("home_page.hero_description")}</p>
          </div>

          {/* SEARCH */}
          <div className="search-box">
            <TextField
              className="custom-textfield"
              size="small"
              label={t("home_page.search_animals")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <Autocomplete
              options={districts}
              getOptionLabel={(o) => (o ? `${o.label} - ${o.si}` : "")}
              value={districts.find((d) => d.value === location) || null}
              onChange={(e, v) => setLocation(v?.value || null)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="custom-textfield"
                  size="small"
                  label={t("home_page.location")}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Autocomplete
              options={categoryList}
              value={category}
              onChange={(e, v) => setCategory(v)}
              getOptionLabel={(option) => option?.name || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="custom-textfield"
                  size="small"
                  label={t("home_page.category")}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Category />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </div>
        </div>
      </section>

      {/* ================= LISTINGS ================= */}
      <section className="listings-container">
        {/* <h2 className="section-title">Featured Listings</h2> */}

        <div className="listing-grid">
          {ads.length === 0 ? (
            <p className="no-data">{t("home_page.no_listings_found")}</p>
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
                  {savedMap[item.id] && (
                    <Bookmark
                      className="saved-badge"
                      sx={{ color: pink[500] }}
                    />
                  )}
                </div>

                {/* INFO */}
                <div className="info">
                  <div className="card-header">
                    <h3>{item.title}</h3>

                    <span className="location-tag">
                      {item.city}, {item.district}
                    </span>
                  </div>

                  <h3 style={{ marginBottom: 0 }}>{item.category?.name}</h3>
                  {item.sub_category && <span>{item.sub_category}</span>}

                  <div className="price-row">
                    <span className="price">Rs. {item.price}</span>
                    <span className="per">
                      {statusChip(item.negotiable ? "Negotiable" : "Fixed")}
                    </span>
                  </div>

                  <div className="rating-row">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
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
                      {t("home_page.view_details")}
                    </button>

                    {user?.role !== "admin" && user?.id !== item.user_id && (
                      <Tooltip
                        title={
                          savedMap[item.id]
                            ? t("home_page.remove_saved")
                            : t("home_page.save_ad")
                        }
                      >
                        <button
                          className={`wishlist-btn ${savedMap[item.id] ? "active" : ""}`}
                          onClick={() => handleToggleSave(item.id)}
                        >
                          {savedMap[item.id] ? (
                            <>
                              <Bookmark style={{ marginRight: 5 }} />
                              {t("home_page.saved")}
                            </>
                          ) : (
                            <>
                              <BookmarkAdd style={{ marginRight: 5 }} />
                              {t("home_page.save_ad")}
                            </>
                          )}
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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

export default Home;
