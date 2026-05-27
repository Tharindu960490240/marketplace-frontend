import React, { useState, useEffect, useCallback } from "react";
// import {
//   GoogleMap,
//   useJsApiLoader,
//   MarkerF,
//   Autocomplete as MapAutocomplete,
// } from "@react-google-maps/api";
// import { useRef } from "react";

import {
  TextField,
  Autocomplete,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import * as AppConst from "../../const/const";
import {
  Title,
  AttachMoney,
  LocationOn,
  Description,
  CloudUpload,
  Close,
  Category,
  ScatterPlot,
} from "@mui/icons-material";

import imageCompression from "browser-image-compression";

import "../styles/postAd.css";

import { createAd, uploadAdImages, deleteAd } from "../../services/adsService";
import { getActiveCategories } from "../../services/categoryService";
import { get_token } from "../../services/authService";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { v4 as uuidv4 } from "uuid";

import { useTranslation } from "react-i18next";

/* ================= VALIDATION ================= */
const nameRegex =
  /^[A-Za-z\u0D80-\u0DFF\p{L}]+(?:\s[A-Za-z\u0D80-\u0DFF\p{L}]+)*$/u;
const priceRegex = /^\d+(\.\d{1,2})?$/;

const MAX_IMAGES = 5;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

// const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };

const PostAd = () => {
  const { t } = useTranslation();

  // const autocompleteRef = useRef(null);

  // Load Google Maps Script
  // const { isLoaded } = useJsApiLoader(AppConst.googleMapsConfig);

  const [categoryList, setCategoryList] = useState([]);

  const [submitted, setSubmitted] = useState(false);

  const [adData, setAdData] = useState({
    title: "",
    category: null,
    sub_category: "",
    price: "",
    district: null,
    city: "",
    description: "",
    negotiable: false,
    coordinates: {
      latitude: null,
      longitude: null,
    },
  });

  const [validation, setValidation] = useState({
    title: true,
    sub_category: true,
    price: true,
    city: true,
    description: true,
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, severity, message });
  };

  const districts = AppConst.DISTRICTS;

  /* ================= CATEGORIES ================= */
  const fetchCategories = useCallback(async () => {
    const token = await get_token();
    if (!token) return showMessage(t("post_ad.session_expired"), "error");

    try {
      setLoading(true);
      const res = await getActiveCategories(token);
      if (res?.success) {
        setCategoryList(res.data || []);
      }
    } catch (err) {
      showMessage(t("post_ad.error_loading_categories"), "error");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ================= LIVE VALIDATION ================= */

  const validateTitle = (val) => {
    const isValid = nameRegex.test(val);
    setValidation((p) => ({ ...p, title: isValid }));
    return isValid;
  };

  const validateSubCategory = (val) => {
    const isValid = nameRegex.test(val);
    setValidation((p) => ({ ...p, sub_category: isValid }));
    return isValid;
  };

  const validatePrice = (val) => {
    const isValid = priceRegex.test(val);
    setValidation((p) => ({ ...p, price: isValid }));
    return isValid;
  };

  const validateCity = (val) => {
    const isValid = nameRegex.test(val);
    setValidation((p) => ({ ...p, city: isValid }));
    return isValid;
  };

  const validateDescription = (val) => {
    const isValid = val.trim().length > 0;
    setValidation((p) => ({ ...p, description: isValid }));
    return isValid;
  };

  /* ================= IMAGE HANDLER ================= */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > MAX_IMAGES) {
      return showMessage(t("post_ad.max_images"), "error");
    }

    const valid = files.filter((f) => ALLOWED_TYPES.includes(f.type));

    const compressedFiles = await Promise.all(
      valid.map(async (file) => {
        const compressed = await compressImage(file);

        return {
          id: uuidv4(),
          file: compressed,
          url: URL.createObjectURL(compressed),
        };
      }),
    );

    setImages((p) => [...p, ...compressedFiles]);
  };
  const removeImage = (id) => {
    setImages((p) => {
      const imageToRemove = p.find((img) => img.id === id);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return p.filter((img) => img.id !== id);
    });
  };

  useEffect(() => {
    return () => {
      images.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [images]);

  // 1. Handle map click to drop a pin
  // const handleMapClick = (e) => {
  //   setAdData((prev) => ({
  //     ...prev,
  //     coordinates: { lat: e.latLng.lat(), lng: e.latLng.lng() },
  //   }));
  // };

  // const onPlaceChanged = () => {
  //   if (autocompleteRef.current !== null) {
  //     const place = autocompleteRef.current.getPlace();
  //     if (!place || !place.geometry || !place.geometry.location) {
  //       return;
  //     }

  //     // let cityName = "";
  //     // if (place.address_components) {
  //     //   const locality = place.address_components.find((c) =>
  //     //     c.types.includes("locality"),
  //     //   );
  //     //   cityName = locality ? locality.long_name : place.name;
  //     // }

  //     setAdData((prev) => ({
  //       ...prev,
  //       coordinates: {
  //         lat: place.geometry.location.lat(),
  //         lng: place.geometry.location.lng(),
  //       },
  //       // city: cityName || prev.city,
  //     }));
  //     // if (cityName) validateCity(cityName);
  //   }
  // };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    setSubmitted(true);

    const isValid =
      nameRegex.test(adData.title) &&
      nameRegex.test(adData.sub_category) &&
      priceRegex.test(adData.price) &&
      nameRegex.test(adData.city) &&
      adData.description.trim().length > 0 &&
      !!adData.category &&
      !!adData.district;

    setValidation({
      title: nameRegex.test(adData.title),
      sub_category: nameRegex.test(adData.sub_category),
      price: priceRegex.test(adData.price),
      city: nameRegex.test(adData.city),
      description: adData.description.trim().length > 0,
    });

    if (!isValid) {
      return showMessage(t("post_ad.fill_all_fields"), "error");
    }

    if (images.length === 0) {
      return showMessage(t("post_ad.image_required"), "error");
    }

    try {
      setLoading(true);

      const token = await get_token();

      if (!token) return showMessage(t("post_ad.session_expired"), "error");

      const payload = {
        title: adData.title,
        description: adData.description,
        category_id: adData.category?.id,
        sub_category: adData.sub_category,
        price: adData.price,
        negotiable: adData.negotiable,
        district: adData.district,
        city: adData.city,
        latitude: adData.coordinates.lat,
        longitude: adData.coordinates.lng,
      };

      const res = await createAd(token, payload);

      if (!res.success) return showMessage(t("post_ad.ad_error"), "error");

      const adId = res.data.ad.id;

      const imgre = await uploadAdImages(
        token,
        adId,
        images.map((i) => i.file),
      );

      if (imgre.success) {
        showMessage(t("post_ad.ad_success"), "success");

        /* RESET */
        setAdData({
          title: "",
          category: null,
          sub_category: "",
          price: "",
          district: null,
          city: "",
          description: "",
          negotiable: false,
          coordinates: {
            latitude: null,
            longitude: null,
          },
        });

        setValidation({
          title: true,
          sub_category: true,
          price: true,
          city: true,
          description: true,
        });
        setImages([]);
        // clearLocationAutocomplete();
      } else {
        await deleteAd(token, adId);
        showMessage(t("post_ad.something_went_wrong"), "warning");
      }
    } catch (err) {
      showMessage(t("post_ad.something_went_wrong"), "error");
    } finally {
      setSubmitted(false);
      setLoading(false);
    }
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      return await imageCompression(file, options);
    } catch (err) {
      console.error("Compression error:", err);
      return file; // fallback to original
    }
  };

  // const clearLocationAutocomplete = () => {
  //   // 1. Clear the Google Maps Autocomplete internal state
  //   if (autocompleteRef.current) {
  //     autocompleteRef.current.set("place", null);
  //   }

  //   // 2. Clear the physical text from the input DOM element
  //   const inputElement = document.getElementById("search-location-input");
  //   if (inputElement) {
  //     inputElement.value = "";
  //   }
  // };

  // useEffect(() => {
  //   clearLocationAutocomplete();
  // }, [adData.district]);

  /* ================= UI ================= */
  return (
    <div className="ads-container">
      <div className="ads-subcontainer">
        <h2>{t("post_ad.title_page")}</h2>

        {/* TITLE + CATEGORY */}
        <div className="form-row desktop-two mobile-full">
          <TextField
            size="small"
            className="custom-textfield"
            label={t("post_ad.title")}
            required
            value={adData.title}
            error={!validation.title}
            helperText={
              !validation.title
                ? t("post_ad.title_error")
                : t("post_ad.title_hint")
            }
            onChange={(e) => {
              setAdData({ ...adData, title: e.target.value });
              validateTitle(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Title />
                </InputAdornment>
              ),
            }}
          />

          <Autocomplete
            size="small"
            options={categoryList}
            value={adData.category}
            onChange={(e, v) => setAdData({ ...adData, category: v })}
            getOptionLabel={(o) => o?.name || ""}
            renderInput={(params) => (
              <TextField
                className="custom-textfield"
                {...params}
                label={t("post_ad.category")}
                required
                error={submitted && !adData.category}
                helperText={
                  submitted && !adData.category
                    ? t("post_ad.category_error")
                    : t("post_ad.category_hint")
                }
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

        {/* SUB CATEGORY + PRICE */}
        <div className="form-row desktop-two mobile-full">
          <TextField
            size="small"
            className="custom-textfield"
            label={t("post_ad.sub_category")}
            required
            value={adData.sub_category}
            error={!validation.sub_category}
            helperText={
              !validation.sub_category
                ? t("post_ad.sub_category_error")
                : t("post_ad.sub_category_hint")
            }
            onChange={(e) => {
              setAdData({ ...adData, sub_category: e.target.value });
              validateSubCategory(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ScatterPlot />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            size="small"
            className="custom-textfield"
            label={t("post_ad.price")}
            required
            value={adData.price}
            error={!validation.price}
            helperText={
              !validation.price
                ? t("post_ad.price_error")
                : t("post_ad.price_hint")
            }
            onChange={(e) => {
              setAdData({ ...adData, price: e.target.value });
              validatePrice(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* LOCATION */}
        <div className="form-row desktop-two mobile-full">
          <Autocomplete
            className="custom-textfield"
            size="small"
            options={districts}
            value={districts.find((d) => d.value === adData.district) || null}
            onChange={(e, v) => {
              setAdData({
                ...adData,
                district: v ? v.value : null,
                // coordinates:
                //   v && v.lat && v.lng
                //     ? { lat: v.lat, lng: v.lng }
                //     : DEFAULT_CENTER,
              });
            }}
            getOptionLabel={(o) => `${o?.label} - ${o?.si}`}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("post_ad.district")}
                required
                error={submitted && !adData.district}
                helperText={
                  submitted && !adData.district
                    ? t("post_ad.district_error")
                    : t("post_ad.district_hint")
                }
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <TextField
            className="custom-textfield"
            size="small"
            label={t("post_ad.city")}
            required
            value={adData.city}
            error={!validation.city}
            helperText={
              !validation.city
                ? t("post_ad.city_error")
                : t("post_ad.city_hint")
            }
            onChange={(e) => {
              setAdData({ ...adData, city: e.target.value });
              validateCity(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="form-row  mobile-full">
          {/* NEGOTIABLE (NEW ADDITION) */}
          <FormControlLabel
            className="custom-textfield"
            control={
              <Checkbox
                checked={adData.negotiable}
                onChange={(e) =>
                  setAdData({
                    ...adData,
                    negotiable: e.target.checked,
                  })
                }
              />
            }
            label={t("post_ad.negotiable")}
          />
        </div>

        {/* {isLoaded && (
          <div className="form-row full" style={{ marginBottom: "15px" }}>
            <MapAutocomplete
              onLoad={(autocomplete) =>
                (autocompleteRef.current = autocomplete)
              }
              onPlaceChanged={onPlaceChanged}
            >
              <TextField
                id="search-location-input"
                fullWidth
                size="small"
                className="custom-textfield"
                label={t("post_ad.search_location")}
                placeholder=""
                helperText={t("post_ad.search_location_helper")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </MapAutocomplete>
          </div>
        )}
        {isLoaded && (
          <div
            className="form-row full"
            style={{ height: "300px", width: "100%", marginBottom: "20px" }}
          >
            <GoogleMap
              mapContainerStyle={{
                height: "100%",
                width: "100%",
                borderRadius: "4px",
              }}
              center={adData.coordinates}
              zoom={13}
              onClick={handleMapClick}
            >
              <MarkerF position={adData.coordinates} />
            </GoogleMap>
          </div>
        )} */}

        <div className="form-row full">
          {/* DESCRIPTION */}
          <TextField
            className="custom-textfield"
            label={t("post_ad.description")}
            multiline
            rows={4}
            required
            value={adData.description}
            error={!validation.description}
            helperText={
              !validation.description
                ? t("post_ad.description_error")
                : t("post_ad.description_hint")
            }
            onChange={(e) => {
              setAdData({
                ...adData,
                description: e.target.value,
              });
              validateDescription(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* UPLOAD */}
        <label
          className={`upload-box ${
            submitted && images.length === 0 ? "required" : ""
          }`}
        >
          <CloudUpload />
          {t("post_ad.upload_images")}
          <input
            type="file"
            multiple
            hidden
            accept="image/jpeg,image/png"
            onChange={handleImageUpload}
          />
        </label>

        {/* PREVIEW */}
        <div className="image-preview">
          {images.map((img) => (
            <div key={img.id} className="image-box">
              <img src={img.url} alt="" />
              <button onClick={() => removeImage(img.id)}>
                <Close />
              </button>
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <button className="button-success" onClick={handleSubmit}>
          {t("post_ad.publish_ad")}
        </button>
      </div>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default PostAd;
