import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  AddPhotoAlternateOutlined,
  Close,
  CategoryOutlined,
  LocationOnOutlined,
  SellOutlined,
} from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";

import "../styles/postAd.css";

import * as AppConst from "../../const/const";
import { createAd, uploadAdImages, deleteAd } from "../../services/adsService";
import { getActiveCategories } from "../../services/categoryService";
import { get_token } from "../../services/authService";
import { useNotify } from "../../context/NotifyContext";
import { isPrice, isText, toPrice } from "../../utils/validation";
import { districtLabel } from "./Home";

const MAX_IMAGES = 5;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const ALLOWED_TYPES = ACCEPT.split(",");

const emptyAd = {
  title: "",
  category: null,
  sub_category: "",
  price: "",
  district: null,
  city: "",
  description: "",
  negotiable: false,
};

const compressImage = async (file) => {
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    });
  } catch {
    return file; // fall back to the original file
  }
};

const PostAd = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();

  const [categoryList, setCategoryList] = useState([]);
  const [adData, setAdData] = useState(emptyAd);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  /* ================= CATEGORIES ================= */
  useEffect(() => {
    (async () => {
      const token = await get_token();
      const res = await getActiveCategories(token);
      if (res.success) setCategoryList(Array.isArray(res.data) ? res.data : []);
      else notify(t("post_ad.error_loading_categories"), "error");
    })();
  }, [notify, t]);

  // Release preview URLs only when the page closes
  // (the old code revoked every preview each time a photo was added)
  useEffect(
    () => () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url)),
    [],
  );

  /* ================= VALIDATION ================= */
  const errors = {
    title: !isText(adData.title, 3),
    category: !adData.category,
    sub_category: !isText(adData.sub_category, 2),
    price: !isPrice(adData.price),
    district: !adData.district,
    city: !isText(adData.city, 2),
    description: adData.description.trim().length < 10,
    images: images.length === 0,
  };
  const show = (field) => (submitted || touched[field]) && errors[field];

  const bind = (field) => ({
    value: adData[field],
    onChange: (e) => setAdData((d) => ({ ...d, [field]: e.target.value })),
    onBlur: () => setTouched((tc) => ({ ...tc, [field]: true })),
    error: show(field),
  });

  /* ================= IMAGES ================= */
  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const valid = files.filter((f) => ALLOWED_TYPES.includes(f.type));
    if (valid.length < files.length) notify(t("post_ad.unsupported_images"), "warning");

    const room = MAX_IMAGES - images.length;
    if (valid.length > room) notify(t("post_ad.max_images"), "warning");
    const accepted = valid.slice(0, Math.max(room, 0));
    if (!accepted.length) return;

    setProcessing(true);
    const prepared = await Promise.all(
      accepted.map(async (file) => {
        const compressed = await compressImage(file);
        return { id: uuidv4(), file: compressed, url: URL.createObjectURL(compressed) };
      }),
    );
    setImages((prev) => [...prev, ...prepared]);
    setProcessing(false);
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((img) => img.id !== id);
    });
  };

  const makeCover = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      return target ? [target, ...prev.filter((img) => img.id !== id)] : prev;
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.values(errors).some(Boolean)) {
      notify(
        errors.images && !Object.entries(errors).some(([k, v]) => k !== "images" && v)
          ? t("post_ad.image_required")
          : t("post_ad.fill_all_fields"),
        "error",
      );
      return;
    }

    setBusy(true);
    const token = await get_token();

    const res = await createAd(token, {
      title: adData.title.trim(),
      description: adData.description.trim(),
      category_id: adData.category.id,
      sub_category: adData.sub_category.trim(),
      price: toPrice(adData.price),
      negotiable: adData.negotiable,
      district: adData.district,
      city: adData.city.trim(),
      latitude: null,
      longitude: null,
    });

    const adId = res.data?.ad?.id ?? res.data?.id;
    if (!res.success || !adId) {
      setBusy(false);
      notify(res.message || t("post_ad.ad_error"), "error");
      return;
    }

    const upload = await uploadAdImages(token, adId, images.map((i) => i.file));
    setBusy(false);

    if (!upload.success) {
      await deleteAd(token, adId); // don't leave an ad without photos
      notify(t("post_ad.upload_failed"), "error");
      return;
    }

    notify(t("post_ad.ad_success"));
    navigate("/my-ads");
  };

  const districts = AppConst.DISTRICTS;

  return (
    <div className="page narrow post-ad">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("post_ad.title_page")}</h1>
          <p className="page-subtitle">{t("post_ad.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ===== Photos ===== */}
        <section className="panel">
          <h2 className="panel-title">
            {t("post_ad.photos")}{" "}
            <span className="panel-count">
              {images.length}/{MAX_IMAGES}
            </span>
          </h2>

          <div
            className={`upload-zone ${dragOver ? "drag" : ""} ${show("images") ? "error" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            {images.map((img, index) => (
              <div key={img.id} className="upload-thumb">
                <img src={img.url} alt="" />
                {index === 0 ? (
                  <span className="cover-badge">{t("post_ad.cover")}</span>
                ) : (
                  <button type="button" className="cover-btn" onClick={() => makeCover(img.id)}>
                    {t("post_ad.make_cover")}
                  </button>
                )}
                <IconButton
                  size="small"
                  className="upload-remove"
                  onClick={() => removeImage(img.id)}
                  aria-label={t("post_ad.remove_photo")}
                >
                  <Close fontSize="small" />
                </IconButton>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <button
                type="button"
                className="upload-add"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
              >
                {processing ? <CircularProgress size={24} /> : <AddPhotoAlternateOutlined />}
                <span>{t("post_ad.upload_images")}</span>
                <small>{t("post_ad.upload_hint")}</small>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept={ACCEPT}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = ""; // allow picking the same file again
              }}
            />
          </div>
          {show("images") && <p className="field-error">{t("post_ad.image_required")}</p>}
        </section>

        {/* ===== Details ===== */}
        <section className="panel">
          <h2 className="panel-title">{t("post_ad.details")}</h2>
          <div className="form-grid">
            <TextField
              className="span-2"
              label={t("post_ad.title")}
              required
              inputProps={{ maxLength: 100 }}
              {...bind("title")}
              helperText={show("title") ? t("post_ad.title_error") : t("post_ad.title_hint")}
            />

            <Autocomplete
              options={categoryList}
              value={adData.category}
              onChange={(_e, v) => setAdData((d) => ({ ...d, category: v }))}
              onBlur={() => setTouched((tc) => ({ ...tc, category: true }))}
              getOptionLabel={(o) => o?.name || ""}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("post_ad.category")}
                  required
                  error={show("category")}
                  helperText={show("category") ? t("post_ad.category_error") : ""}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <TextField
              label={t("post_ad.sub_category")}
              required
              inputProps={{ maxLength: 60 }}
              {...bind("sub_category")}
              helperText={
                show("sub_category") ? t("post_ad.sub_category_error") : t("post_ad.sub_category_hint")
              }
            />

            <TextField
              className="span-2"
              label={t("post_ad.description")}
              required
              multiline
              minRows={5}
              inputProps={{ maxLength: 2000 }}
              {...bind("description")}
              helperText={
                show("description") ? t("post_ad.description_error") : t("post_ad.description_hint")
              }
            />
          </div>
        </section>

        {/* ===== Price & location ===== */}
        <section className="panel">
          <h2 className="panel-title">{t("post_ad.price_location")}</h2>
          <div className="form-grid">
            <TextField
              label={t("post_ad.price")}
              required
              inputMode="decimal"
              {...bind("price")}
              onChange={(e) =>
                setAdData((d) => ({ ...d, price: e.target.value.replace(/[^\d.,]/g, "") }))
              }
              helperText={show("price") ? t("post_ad.price_error") : t("post_ad.price_hint")}
              InputProps={{
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
              }}
            />

            <FormControlLabel
              className="negotiable-toggle"
              control={
                <Checkbox
                  checked={adData.negotiable}
                  onChange={(e) => setAdData((d) => ({ ...d, negotiable: e.target.checked }))}
                />
              }
              label={
                <span className="negotiable-label">
                  <SellOutlined fontSize="small" /> {t("post_ad.negotiable")}
                </span>
              }
            />

            <Autocomplete
              options={districts}
              value={districts.find((d) => d.value === adData.district) || null}
              onChange={(_e, v) => setAdData((d) => ({ ...d, district: v?.value || null }))}
              onBlur={() => setTouched((tc) => ({ ...tc, district: true }))}
              getOptionLabel={(o) => districtLabel(o, i18n.language)}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("post_ad.district")}
                  required
                  error={show("district")}
                  helperText={show("district") ? t("post_ad.district_error") : ""}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <TextField
              label={t("post_ad.city")}
              required
              inputProps={{ maxLength: 60 }}
              {...bind("city")}
              helperText={show("city") ? t("post_ad.city_error") : t("post_ad.city_hint")}
            />
          </div>
        </section>

        <div className="post-ad-submit">
          <p>{t("post_ad.review_note")}</p>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={busy || processing}
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {busy ? t("post_ad.publishing") : t("post_ad.publish_ad")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostAd;
