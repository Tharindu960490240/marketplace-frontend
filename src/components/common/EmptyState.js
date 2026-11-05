import React from "react";

const EmptyState = ({ icon, title, text, action, compact = false }) => (
  <div className={`empty-state ${compact ? "compact" : ""}`}>
    {icon && <div className="empty-icon">{icon}</div>}
    {title && <h3>{title}</h3>}
    {text && <p>{text}</p>}
    {action && <div className="empty-action">{action}</div>}
  </div>
);

export default EmptyState;
