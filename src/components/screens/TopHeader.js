import React, { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  AddRounded,
  AccountCircleOutlined,
  BookmarkBorder,
  CampaignOutlined,
  CategoryOutlined,
  ChatBubbleOutline,
  Close,
  DarkModeOutlined,
  DashboardOutlined,
  LightModeOutlined,
  Logout,
  Menu as MenuIcon,
  NotificationsNoneRounded,
  PeopleOutline,
  StorefrontOutlined,
  TranslateRounded,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/topHeader.css";

import * as AppConst from "../../const/const";
import { get_token } from "../../services/authService";
import { getSavedAds } from "../../services/savedAdService";
import { getNotificationsCount } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { usePreferences } from "../../context/PreferencesContext";
import { useNotify } from "../../context/NotifyContext";

const POLL_MS = 60000;

const TopHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const { user, isSignedIn, signOut } = useAuth();
  const { mode, toggleMode, language, toggleLanguage } = usePreferences();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  const isUser = user?.role === "user";
  const isAdmin = user?.role === "admin";

  /* ================= COUNTS ================= */
  const fetchSavedCount = useCallback(async () => {
    const token = await get_token();
    if (!token) return setSavedCount(0);
    // Only the total is needed, so ask for a single item
    const res = await getSavedAds(token, { page: 1, limit: 1 });
    setSavedCount(res.success ? res.total : 0);
  }, []);

  const fetchNotificationCount = useCallback(async () => {
    const token = await get_token();
    if (!token) return setNotificationCount(0);
    const res = await getNotificationsCount(token);
    if (res.success) setNotificationCount(Number(res.data) || 0);
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setSavedCount(0);
      setNotificationCount(0);
      return undefined;
    }

    fetchNotificationCount();
    if (isUser) fetchSavedCount();

    const timer = setInterval(fetchNotificationCount, POLL_MS);
    window.addEventListener("savedChanged", fetchSavedCount);
    window.addEventListener("notificationUpdated", fetchNotificationCount);

    return () => {
      clearInterval(timer);
      window.removeEventListener("savedChanged", fetchSavedCount);
      window.removeEventListener("notificationUpdated", fetchNotificationCount);
    };
  }, [isSignedIn, isUser, fetchSavedCount, fetchNotificationCount]);

  /* ================= ACTIONS ================= */
  const goTo = (path) => {
    setMenuAnchor(null);
    setDrawerOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuAnchor(null);
    setDrawerOpen(false);
    signOut();
    notify(t("header.logoutSuccess"));
    navigate("/home");
  };

  /* One list of account links, shared by the menu and the drawer */
  const accountLinks = [
    { show: true, to: "/profile", icon: <AccountCircleOutlined />, label: t("header.profile") },
    { show: isAdmin, to: "/dashboard", icon: <DashboardOutlined />, label: t("header.dashboard") },
    { show: isAdmin, to: "/ads", icon: <CampaignOutlined />, label: t("header.manageAds") },
    { show: isAdmin, to: "/users", icon: <PeopleOutline />, label: t("header.manageUsers") },
    { show: isAdmin, to: "/categories", icon: <CategoryOutlined />, label: t("header.manageCategories") },
    { show: isUser, to: "/my-ads", icon: <CampaignOutlined />, label: t("header.myAds") },
    {
      show: isUser,
      to: "/saved-ads",
      icon: <BookmarkBorder />,
      label: t("header.mySavedAds"),
      count: savedCount,
    },
    {
      show: true,
      to: "/support",
      icon: <ChatBubbleOutline />,
      label: isUser ? t("header.contactUs") : t("header.giveSupport"),
      count: notificationCount,
    },
  ].filter((l) => l.show);

  const avatarSrc = user?.profile_image || AppConst.PROFILE_PLACEHOLDER_IMAGE;

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <button className="brand" onClick={() => goTo("/home")} aria-label={t("header.home")}>
            <img
              src={mode === "dark" ? "/assets/navbar_logo_d.png" : "/assets/navbar_logo.png"}
              alt="Agri Link Services"
              className="brand-logo"
            />
          </button>

          <nav className="header-nav" aria-label={t("header.menu")}>
            <NavLink to="/home" className="header-link">
              <StorefrontOutlined fontSize="small" />
              {t("header.browse")}
            </NavLink>
            {isUser && (
              <NavLink to="/my-ads" className="header-link">
                <CampaignOutlined fontSize="small" />
                {t("header.myAds")}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/dashboard" className="header-link">
                <DashboardOutlined fontSize="small" />
                {t("header.dashboard")}
              </NavLink>
            )}
          </nav>

          <div className="header-actions">
            <Tooltip title={t("header.language")}>
              <Button
                className="header-lang hide-sm"
                color="inherit"
                size="small"
                startIcon={<TranslateRounded fontSize="small" />}
                onClick={toggleLanguage}
              >
                {language === "en" ? "සිංහල" : "English"}
              </Button>
            </Tooltip>

            <Tooltip title={mode === "dark" ? t("header.light_mode") : t("header.dark_mode")}>
              <IconButton className="header-icon hide-sm" onClick={toggleMode}>
                {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
              </IconButton>
            </Tooltip>

            {isSignedIn && (
              <Tooltip title={t("header.notifications")}>
                <IconButton className="header-icon" onClick={() => goTo("/support")}>
                  <Badge color="error" badgeContent={notificationCount} max={99}>
                    <NotificationsNoneRounded />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {isUser && (
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                className="hide-sm"
                onClick={() => goTo("/post-ad")}
              >
                {t("header.postAd")}
              </Button>
            )}

            {!isSignedIn && (
              <div className="hide-sm header-auth">
                <Button color="inherit" onClick={() => goTo("/signin")}>
                  {t("header.signIn")}
                </Button>
                <Button variant="contained" onClick={() => goTo("/signup")}>
                  {t("header.signUp")}
                </Button>
              </div>
            )}

            {isSignedIn && (
              <button
                className="avatar-button hide-sm"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={!!menuAnchor}
              >
                <Avatar src={avatarSrc} sx={{ width: 34, height: 34 }} />
                <span className="avatar-name">{user?.first_name}</span>
              </button>
            )}

            <IconButton
              className="header-icon show-sm"
              onClick={() => setDrawerOpen(true)}
              aria-label={t("header.menu")}
            >
              <MenuIcon />
            </IconButton>
          </div>
        </div>
      </header>

      {/* ================= DESKTOP ACCOUNT MENU ================= */}
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ className: "account-menu" }}
      >
        <div className="account-menu-head">
          <strong>
            {user?.first_name} {user?.last_name}
          </strong>
          <span>{user?.email}</span>
        </div>
        <Divider />
        {accountLinks.map((link) => (
          <MenuItem key={link.to} onClick={() => goTo(link.to)}>
            <ListItemIcon>{link.icon}</ListItemIcon>
            <span className="menu-label">{link.label}</span>
            {link.count > 0 && <span className="menu-count">{link.count}</span>}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          {t("header.logout")}
        </MenuItem>
      </Menu>

      {/* ================= MOBILE DRAWER ================= */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ className: "mobile-drawer" }}
      >
        <div className="drawer-head">
          {isSignedIn ? (
            <div className="drawer-user">
              <Avatar src={avatarSrc} />
              <div>
                <strong>{user?.first_name}</strong>
                <span>{user?.email}</span>
              </div>
            </div>
          ) : (
            <strong>{t("header.menu")}</strong>
          )}
          <IconButton onClick={() => setDrawerOpen(false)} aria-label={t("common.close")}>
            <Close />
          </IconButton>
        </div>

        <div className="drawer-body">
          {isUser && (
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddRounded />}
              onClick={() => goTo("/post-ad")}
            >
              {t("header.postAd")}
            </Button>
          )}

          <button className="drawer-link" onClick={() => goTo("/home")}>
            <StorefrontOutlined /> {t("header.browse")}
          </button>

          {isSignedIn &&
            accountLinks.map((link) => (
              <button key={link.to} className="drawer-link" onClick={() => goTo(link.to)}>
                {link.icon}
                <span className="menu-label">{link.label}</span>
                {link.count > 0 && <span className="menu-count">{link.count}</span>}
              </button>
            ))}

          {!isSignedIn && (
            <div className="drawer-auth">
              <Button variant="outlined" fullWidth onClick={() => goTo("/signin")}>
                {t("header.signIn")}
              </Button>
              <Button variant="contained" fullWidth onClick={() => goTo("/signup")}>
                {t("header.signUp")}
              </Button>
            </div>
          )}

          <Divider sx={{ my: 1 }} />

          <button className="drawer-link" onClick={toggleMode}>
            {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            {mode === "dark" ? t("header.light_mode") : t("header.dark_mode")}
          </button>
          <button className="drawer-link" onClick={toggleLanguage}>
            <TranslateRounded />
            {language === "en" ? "සිංහල" : "English"}
          </button>

          {isSignedIn && (
            <button className="drawer-link danger" onClick={handleLogout}>
              <Logout /> {t("header.logout")}
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default TopHeader;
