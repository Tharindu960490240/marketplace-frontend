import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Chip } from "@mui/material";

import {
  TrendingUp,
  People,
  Visibility,
  HourglassEmpty,
  Category,
  AdsClick,
} from "@mui/icons-material";

/* ================= CHART IMPORTS ================= */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import { getAdminDashboardStats } from "../../services/dashboardService";
import { get_token } from "../../services/authService";

import LoadingSpinner from "./LoadingSpinner";
import CustomSnackbar from "./CustomSnackbar";

import { useTranslation } from "react-i18next";

import "../styles/adminDashboard.css";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, severity, message });
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      const token = await get_token();

      if (!token) {
        showMessage(t("admin_dashboard.session_expired"), "error");
        return;
      }

      setLoading(true);

      try {
        const res = await getAdminDashboardStats(token);

        if (res.success) {
          setData(res.data);
        } else {
          showMessage(t("admin_dashboard.failed_load_dashboard"), "error");
        }
      } catch (err) {
        showMessage(t("admin_dashboard.server_error"), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const goTo = (path) => {
    navigate(path);
  };

  if (!data) return <LoadingSpinner open={!data} />;

  /* ================= FIX DATA ================= */
  const growthData = data.growth.map((g) => ({
    ...g,
    ads: Number(g.ads),
  }));

  /* ================= UPDATE statusChip ================= */

  const statusChip = (status) => {
    const map = {
      pending: "warning",
      active: "success",
      sold: "info",
      rejected: "warning",
      deleted: "error",
    };

    const labelMap = {
      pending: t("admin_dashboard.pending"),
      active: t("admin_dashboard.active"),
      sold: t("admin_dashboard.sold"),
      rejected: t("admin_dashboard.rejected"),
      deleted: t("admin_dashboard.deleted"),
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
    <Box className="admin-dashboard">
      {/* ================= STATS ================= */}
      <Grid container spacing={2} className="stats-grid">
        <Grid item xs={12} sm={6} md={3}>
          <div className="stat-card green">
            <TrendingUp />
            <div>
              <h2>{data.activeAds}</h2>
              <p>{t("admin_dashboard.active_ads")}</p>
            </div>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <div className="stat-card orange">
            <HourglassEmpty />
            <div>
              <h2>{data.pendingAds}</h2>
              <p>{t("admin_dashboard.pending_ads")}</p>
            </div>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <div className="stat-card blue">
            <People />
            <div>
              <h2>{data.users}</h2>
              <p>{t("admin_dashboard.users")}</p>
            </div>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <div className="stat-card purple">
            <Visibility />
            <div>
              <h2>{data.views}</h2>
              <p>{t("admin_dashboard.views")}</p>
            </div>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <div className="stat-card teal">
            <AdsClick />
            <div>
              <h2>{data.totalAds}</h2>
              <p>{t("admin_dashboard.total_ads")}</p>
            </div>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <div className="stat-card indigo">
            <Category />
            <div>
              <h2>{data.categories.length}</h2>
              <p>{t("admin_dashboard.categories")}</p>
            </div>
          </div>
        </Grid>
      </Grid>

      {/* ================= CHARTS ================= */}
      <Grid container spacing={2} className="section">
        {/* GROWTH */}
        <Grid item xs={12} md={6}>
          <div className="card-box">
            <h3>{t("admin_dashboard.growth_overview")}</h3>

            <p>{t("admin_dashboard.ads_created_per_month")}</p>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ads"
                  stroke="#4caf50"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Grid>

        {/* CATEGORY */}
        <Grid item xs={12} md={6}>
          <div className="card-box">
            <h3>{t("admin_dashboard.category_distribution")}</h3>

            <p>{t("admin_dashboard.ads_by_category")}</p>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Grid>
      </Grid>

      {/* ================= TABLE SECTION ================= */}
      <Grid container spacing={2} className="section">
        <Grid item xs={12} md={4}>
          <div className="card-box">
            <h3>{t("admin_dashboard.recent_ads")}</h3>

            {data.recentAds.map((ad) => (
              <div className="list-item" key={ad.id}>
                <span>{ad.title}</span>
                <span className="badge">{statusChip(ad.status)}</span>
              </div>
            ))}
          </div>
        </Grid>

        <Grid item xs={12} md={4}>
          <div className="card-box">
            <h3>{t("admin_dashboard.top_users")}</h3>

            {data.topUsers.map((u) => (
              <div className="list-item" key={u.id}>
                <span>{u.name}</span>
                <span>{t("admin_dashboard.ads_count", { count: u.ads })}</span>
              </div>
            ))}
          </div>
        </Grid>

        <Grid item xs={12} md={4}>
          <div className="card-box">
            <h3>{t("admin_dashboard.activity")}</h3>

            {data.activity.map((a, i) => (
              <div className="activity" key={i}>
                {a.message}
              </div>
            ))}
          </div>
        </Grid>
      </Grid>

      {/* ================= ACTIONS ================= */}
      <div className="button-group">
        <button className="button-success" onClick={() => goTo("/ads")}>
          {t("admin_dashboard.manage_ads")}
        </button>
        <button className="button-success" onClick={() => goTo("/categories")}>
          {t("admin_dashboard.manage_categories")}
        </button>
        <button className="button-success" onClick={() => goTo("/users")}>
          {t("admin_dashboard.manage_users")}
        </button>
      </div>

      <CustomSnackbar {...snackbar} onClose={handleClose} />
      <LoadingSpinner open={loading} />
    </Box>
  );
};

export default AdminDashboard;
