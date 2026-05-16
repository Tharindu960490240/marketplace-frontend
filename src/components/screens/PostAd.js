import React, { useState, useEffect, useCallback } from "react";
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

import "../styles/postAd.css";

import { createAd, uploadAdImages } from "../../services/adsService";
import { getActiveCategories } from "../../services/categoryService";
import { get_token } from "../../services/authService";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

/* ================= VALIDATION ================= */
const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
const priceRegex = /^\d+(\.\d{1,2})?$/;

const MAX_IMAGES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const PostAd = () => {
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
    if (!token)
      return showMessage("Session expired. Please login again.", "error");

    try {
      setLoading(true);
      const res = await getActiveCategories(token);
      if (res?.success) {
        setCategoryList(res.data || []);
      }
    } catch {
      showMessage("Error loading categories", "error");
    } finally {
      setLoading(false);
    }
  }, []);

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
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > MAX_IMAGES) {
      return showMessage("Max 5 images allowed", "error");
    }

    const valid = files.filter((f) => ALLOWED_TYPES.includes(f.type));

    const newImages = valid.map((file) => ({
      id: crypto.randomUUID(), // unique id
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((p) => [...p, ...newImages]);
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
      return showMessage(
        "Please fill in all the fields with valid information.",
        "error",
      );
    }

    if (images.length === 0) {
      return showMessage("At least one image is required", "error");
    }

    try {
      setLoading(true);

      const token = await get_token();

      if (!token)
        return showMessage("Session expired. Please login again.", "error");

      const payload = {
        title: adData.title,
        description: adData.description,
        category_id: adData.category?.id,
        sub_category: adData.sub_category,
        price: adData.price,
        negotiable: adData.negotiable,
        district: adData.district?.label,
        city: adData.city,
      };

      const res = await createAd(token, payload);

      if (!res.success) return showMessage(res.message, "error");

      const adId = res.data.ad.id;

      if (images.length > 0) {
        await uploadAdImages(
          token,
          adId,
          images.map((i) => i.file),
        );
      }

      showMessage("Ad published successfully!", "success");

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
      });

      setValidation({
        title: true,
        sub_category: true,
        price: true,
        city: true,
        description: true,
      });
      setImages([]);
    } catch {
      showMessage("Something went wrong", "error");
    } finally {
      setSubmitted(false);
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="ads-container">
      <div className="ads-box">
        <h2>Post New Ad</h2>

        {/* TITLE + CATEGORY */}
        <div className="form-row desktop-two mobile-full">
          <TextField
            size="small"
            className="custom-textfield"
            label="Title"
            required
            value={adData.title}
            error={!validation.title}
            helperText={
              !validation.title
                ? "Title must contain only letters."
                : "eg: Dog for sale"
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
                label="Category"
                required
                error={submitted && !adData.category}
                helperText={
                  !adData.category ? "Category is required" : "eg: Animal"
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
            label="Sub Category"
            required
            value={adData.sub_category}
            error={!validation.sub_category}
            helperText={
              !validation.sub_category
                ? "Sub Category must contain only letters."
                : "eg: Rottweiler Dog"
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
            label="Price"
            required
            value={adData.price}
            error={!validation.price}
            helperText={
              !validation.price
                ? "Invalid price (100 or 100.50)"
                : "e.g. 1500.00"
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
            value={adData.district}
            onChange={(e, v) => setAdData({ ...adData, district: v })}
            getOptionLabel={(o) => o?.label || ""}
            renderInput={(params) => (
              <TextField
                {...params}
                label="District"
                required
                error={submitted && !adData.district}
                helperText={
                  !adData.district ? "District is required" : "eg: Colombo"
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
            label="City"
            required
            value={adData.city}
            error={!validation.city}
            helperText={
              !validation.city
                ? "City must contain only letters."
                : "eg:  Dehiwala"
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
            label="Negotiable"
          />
        </div>
        <div className="form-row full">
          {/* DESCRIPTION */}
          <TextField
            className="custom-textfield"
            label="Description"
            multiline
            rows={4}
            required
            value={adData.description}
            error={!validation.description}
            helperText={
              !validation.description
                ? "Description is required"
                : "eg: good healthy doge for sale "
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
          Upload Images
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
          Publish Ad
        </button>
      </div>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </div>
  );
};

export default PostAd;
