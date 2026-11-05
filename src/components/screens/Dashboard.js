import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  CampaignOutlined,
  CategoryOutlined,
  ErrorOutlineRounded,
  HourglassEmptyRounded,
  PeopleOutline,
  TrendingUpRounded,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";

import { getAdminDashboardStats } from "../../services/dashboardService";
import { get_token } from "../../services/authService";
import { formatNumber } from "../../utils/format";
import AdminLayout from "../common/AdminLayout";
import PageLoader from "../common/PageLoader";
import EmptyState from "../common/EmptyState";
import StatusChip from "../common/StatusChip";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const load = useCallback(async () => {
    setStatus("loading");
    const token = await get_token();
    const res = await getAdminDashboardStats(token);
    if (res.success && res.data) {
      setData(res.data);
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartColor = theme.palette.primary.main;
  const gridColor = theme.palette.divider;
  const axisColor = theme.palette.text.secondary;

  const growth = (data?.growth || []).map((g) => ({ ...g, ads: Number(g.ads) || 0 }));
  const categories = (data?.categories || []).map((c) => ({ ...c, count: Number(c.count) || 0 }));

  const stats = data
    ? [
        { to: "/ads", icon: <TrendingUpRounded />, value: data.activeAds, label: t("admin_dashboard.active_ads") },
        {
          to: "/ads",
          icon: <HourglassEmptyRounded />,
          value: data.pendingAds,
          label: t("admin_dashboard.pending_ads"),
          attention: Number(data.pendingAds) > 0,
        },
        { to: "/ads", icon: <CampaignOutlined />, value: data.totalAds, label: t("admin_dashboard.total_ads") },
        { to: "/users", icon: <PeopleOutline />, value: data.users, label: t("admin_dashboard.users") },
        { icon: <VisibilityOutlined />, value: data.views, label: t("admin_dashboard.views") },
        { to: "/categories", icon: <CategoryOutlined />, value: categories.length, label: t("admin_dashboard.categories") },
      ]
    : [];

  return (
    <AdminLayout title={t("header.dashboard")} subtitle={t("admin_dashboard.subtitle")}>
      {status === "loading" && <PageLoader />}

      {status === "error" && (
        <EmptyState
          icon={<ErrorOutlineRounded />}
          title={t("admin_dashboard.failed_load_dashboard")}
          action={
            <Button variant="contained" onClick={load}>
              {t("common.try_again")}
            </Button>
          }
        />
      )}

      {status === "ready" && (
        <>
          <div className="stat-grid">
            {stats.map((s) => {
              const Tag = s.to ? Link : "div";
              return (
                <Tag
                  key={s.label}
                  to={s.to}
                  className={`stat-tile ${s.attention ? "attention" : ""}`}
                >
                  <span className="stat-icon">{s.icon}</span>
                  <span>
                    <span className="stat-value">{formatNumber(s.value)}</span>
                    <span className="stat-label" style={{ display: "block" }}>
                      {s.label}
                    </span>
                  </span>
                </Tag>
              );
            })}
          </div>

          <div className="dash-grid">
            <section className="dash-card">
              <h2>{t("admin_dashboard.growth_overview")}</h2>
              <p>{t("admin_dashboard.ads_created_per_month")}</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={growth} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridColor} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="ads"
                    name={t("admin_dashboard.ads")}
                    stroke={chartColor}
                    strokeWidth={2.5}
                    fill="url(#growthFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </section>

            <section className="dash-card">
              <h2>{t("admin_dashboard.category_distribution")}</h2>
              <p>{t("admin_dashboard.ads_by_category")}</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categories} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: theme.palette.action.hover }} />
                  <Bar
                    dataKey="count"
                    name={t("admin_dashboard.ads")}
                    fill={chartColor}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>

          <div className="dash-grid three">
            <section className="dash-card">
              <h2>{t("admin_dashboard.recent_ads")}</h2>
              <ul className="dash-list">
                {(data.recentAds || []).map((ad) => (
                  <li key={ad.id}>
                    <Link to={`/ad/${ad.id}`}>{ad.title}</Link>
                    <StatusChip status={ad.status} />
                  </li>
                ))}
              </ul>
            </section>

            <section className="dash-card">
              <h2>{t("admin_dashboard.top_users")}</h2>
              <ul className="dash-list">
                {(data.topUsers || []).map((u) => (
                  <li key={u.id}>
                    <span>{u.name}</span>
                    <span className="muted">{t("admin_dashboard.ads_count", { count: u.ads })}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="dash-card">
              <h2>{t("admin_dashboard.activity")}</h2>
              <ul className="dash-list activity">
                {(data.activity || []).map((a, i) => (
                  <li key={i}>{a.message}</li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
