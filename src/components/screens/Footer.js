import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  YouTube,
  LinkedIn,
  EmailOutlined,
  PhoneOutlined,
  LanguageOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import "../styles/footer.css";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-row">
            <img src="/assets/footerlogo.png" alt="" className="footer-logo" />
            <strong>{t("footer.companyName")}</strong>
          </div>
          <p>{t("footer.companyDesc")}</p>
          <div className="footer-social">
            <a
              href="https://www.youtube.com/@Agri_Link"
              target="_blank"
              rel="noreferrer"
              aria-label={t("footer.youtube")}
            >
              <YouTube />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100085256541352"
              target="_blank"
              rel="noreferrer"
              aria-label={t("footer.facebook")}
            >
              <Facebook />
            </a>
            <a
              href="https://www.linkedin.com/company/agri-link-services/"
              target="_blank"
              rel="noreferrer"
              aria-label={t("footer.linkedin")}
            >
              <LinkedIn />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3>{t("footer.marketplace")}</h3>
          <Link to="/home">{t("header.browse")}</Link>
          <Link to="/post-ad">{t("header.postAd")}</Link>
          <Link to="/support">{t("header.contactUs")}</Link>
        </div>

        <div className="footer-col">
          <h3>{t("footer.contact")}</h3>
          <a href="tel:+94773782149">
            <PhoneOutlined fontSize="small" /> +94 77 378 2149
          </a>
          <a href="tel:+94332310145">
            <PhoneOutlined fontSize="small" /> +94 33 231 0145
          </a>
          <a href="mailto:info@agrilinkservices.com">
            <EmailOutlined fontSize="small" /> info@agrilinkservices.com
          </a>
          <a href="https://agrilinkservices.com/" target="_blank" rel="noreferrer">
            <LanguageOutlined fontSize="small" /> {t("footer.website")}
          </a>
        </div>
      </div>

      <div className="footer-bottom">{t("footer.copyright")}</div>
    </footer>
  );
};

export default Footer;
