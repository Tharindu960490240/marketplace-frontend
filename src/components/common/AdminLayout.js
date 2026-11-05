import React from "react";
import { NavLink } from "react-router-dom";
import {
  DashboardOutlined,
  CampaignOutlined,
  PeopleOutline,
  CategoryOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/admin.css";

/* Shared frame for admin screens: section nav + page header. */
const AdminLayout = ({ title, subtitle, actions, children }) => {
  const { t } = useTranslation();

  const links = [
    { to: "/dashboard", icon: <DashboardOutlined />, label: t("header.dashboard") },
    { to: "/ads", icon: <CampaignOutlined />, label: t("header.manageAds") },
    { to: "/users", icon: <PeopleOutline />, label: t("header.manageUsers") },
    { to: "/categories", icon: <CategoryOutlined />, label: t("header.manageCategories") },
    { to: "/support", icon: <SupportAgentOutlined />, label: t("header.giveSupport") },
  ];

  return (
    <div className="admin-shell">
      <nav className="admin-nav" aria-label={t("admin.nav_label")}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <section className="admin-main">
        <header className="admin-page-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="admin-page-actions">{actions}</div>}
        </header>
        {children}
      </section>
    </div>
  );
};

export default AdminLayout;
