import "../styles/footer.css";
import {
  Facebook,
  YouTube,
  LinkedIn,
  Email,
  Phone,
  Language,
} from "@mui/icons-material";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ================= COMPANY ================= */}
        <div className="footer-col">
          <div className="footer-brand">
            <img
              src="/assets/footerlogo.png"
              alt="Agri Link Services"
              className="footer-logo"
            />
            <h3>Agri Link Services</h3>
          </div>

          <p className="desc">
            Trusted agricultural & livestock service provider in Sri Lanka.
          </p>

          <a href="https://agrilinkservices.com/" target="_blank" rel="noreferrer">
            <Language /> agrilinkservices.com
          </a>
        </div>

        {/* ================= CONTACT ================= */}
        <div className="footer-col">
          <h3>Contact</h3>

          <a href="tel:+94773782149">
            <Phone /> +94 77 378 2149
          </a>

          <a href="tel:+94332310145">
            <Phone /> +94 33 231 0145
          </a>

          <a href="mailto:info@agrilinkservices.com">
            <Email /> info@agrilinkservices.com
          </a>
        </div>

        {/* ================= SOCIAL ================= */}
        <div className="footer-col">
          <h3>Follow Us</h3>

          <a href="https://www.youtube.com/@Agri_Link" target="_blank" rel="noreferrer">
            <YouTube /> YouTube
          </a>

          <a href="https://www.facebook.com/profile.php?id=100085256541352" target="_blank" rel="noreferrer">
            <Facebook /> Facebook
          </a>

          <a href="https://www.linkedin.com/company/agri-link-services/" target="_blank" rel="noreferrer">
            <LinkedIn /> LinkedIn
          </a>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 T&S Private Limited. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;