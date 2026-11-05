import React from "react";

import AdminNav from "./AdminNav";
import "../styles/admin.css";

/* Shared frame for admin screens: section nav + page header. */
const AdminLayout = ({ title, subtitle, actions, children }) => {
  return (
    <div className="admin-shell">
      <AdminNav />

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