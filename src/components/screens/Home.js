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

const Home = () => {
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
        message: "Error loading categories",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);



  const fetchAds = useCallback(async () => {
    try {
      const token = await get_token();
      setLoading(true);

      const res = await getAds(
        {
          page: page + 1,
          limit: rowsPerPage,
          search: searchText,
          district: location?.label,
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
          message: res.message || "Failed to load ads",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Server error while loading ads",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchText, location?.label, category?.id]);

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
          message: res.message || "Failed to update views",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to update views",
        severity: "error",
      });
    }
  };

  const handleToggleSave = async (adId) => {
    const token = await get_token();

    if (!token) {
      return setSnackbar({
        open: true,
        message: "Session expired. Please login again.",
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
          message: isSaved ? "Removed from saved" : "Ad saved",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to update save",
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
      {/* ================= HERO ================= */}
      <section className="hero-search">
        <div className="container">
          <div className="hero-content">
            <h1>Your Marketplace for Animals, Pet Care & Farm Supplies</h1>
            <p>
              Buy and sell pets, livestock, animal food, and veterinary
              medicines safely and easily across Sri Lanka
            </p>
          </div>

          {/* SEARCH */}
          <div className="search-box">
            <TextField
              className="custom-textfield"
              size="small"
              label="Search Animals"
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
              value={location}
              onChange={(e, v) => setLocation(v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="custom-textfield"
                  size="small"
                  label="Location"
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
                  label="Category"
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
            <p className="no-data">No listings found</p>
          ) : (
            ads.map((item) => (
              <div className="listing-card modern" key={item.id}>
                {/* IMAGE */}
                <div className="img">
                  <img
                    src={
                      item.primary_image
                        ? AppConst.ADS_PLACEHOLDER_IMAGE + item.primary_image
                        : AppConst.ADS_PLACEHOLDER_IMAGE +
                          "uploads/profile_pic/user.png"
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

                  <p>{item.sub_category}</p>

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
                      View Details
                    </button>

                    {user?.role !== "admin" && user?.id !== item.user_id && (
                      <Tooltip
                        title={
                          savedMap[item.id] ? "Remove from saved" : "Save ad"
                        }
                      >
                        <button
                          className={`wishlist-btn ${savedMap[item.id] ? "active" : ""}`}
                          onClick={() => handleToggleSave(item.id)}
                        >
                          {savedMap[item.id] ? (
                            <>
                              <Bookmark style={{ marginRight: 5 }} />
                              Saved
                            </>
                          ) : (
                            <>
                              <BookmarkAdd style={{ marginRight: 5 }} />
                              Save
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
