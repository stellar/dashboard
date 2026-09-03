import React from "react";

// Replaces the muicss Panel. Standardizes the widget header that the old
// components hand-rolled (".widget-name" + floating ".api-link").
export default function Card({ title, apiUrl, tag, children, className }) {
  const hasHeader = title || apiUrl || tag;
  return (
    <div className={`card ${className || ""}`}>
      {hasHeader ? (
        <div className="card-header">
          {title ? <h3 className="card-title">{title}</h3> : null}
          {tag}
          {apiUrl ? (
            <a
              className="card-api-link"
              href={apiUrl}
              target="_blank"
              rel="noreferrer"
              title="Public API endpoint for this data"
            >
              API
            </a>
          ) : null}
        </div>
      ) : null}
      <div className="card-body">{children}</div>
    </div>
  );
}
