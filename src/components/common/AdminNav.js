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

/* The admin section links. Used as a sidebar inside AdminLayout, and as a
   horizontal bar on the Support page (pass className="admin-nav-bar"). */
const AdminNav = ({ className = "" }) => {
  const { t } = useTranslation();

  const links = [
    { to: "/dashboard", icon: <DashboardOutlined />, label: t("header.dashboard") },
    { to: "/ads", icon: <CampaignOutlined />, label: t("header.manageAds") },
    { to: "/users", icon: <PeopleOutline />, label: t("header.manageUsers") },
    { to: "/categories", icon: <CategoryOutlined />, label: t("header.manageCategories") },
    { to: "/support", icon: <SupportAgentOutlined />, label: t("header.giveSupport") },
  ];

  return (
    <nav className={`admin-nav ${className}`} aria-label={t("admin.nav_label")}>
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
  );
};

export default AdminNav;
