"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const route = (0, express_1.Router)();
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function buildReturnPage(options) {
    const title = escapeHtml(options.title);
    const subtitle = escapeHtml(options.subtitle);
    const deepLink = escapeHtml(options.deepLink);
    const buttonLabel = escapeHtml(options.buttonLabel);
    const accentColor = escapeHtml(options.accentColor);
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f4ee;
        --panel: #ffffff;
        --text: #1f1a17;
        --muted: #6f655d;
        --accent: ${accentColor};
        --border: #e9dfd2;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background: radial-gradient(circle at top, #fff7ef 0%, var(--bg) 60%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--text);
      }
      .card {
        width: min(420px, 100%);
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 18px 48px rgba(17, 12, 8, 0.08);
        text-align: center;
      }
      .badge {
        width: 68px;
        height: 68px;
        margin: 0 auto 18px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--accent) 14%, white);
        display: grid;
        place-items: center;
        font-size: 30px;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 28px;
        line-height: 1.1;
      }
      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.5;
      }
      .actions {
        display: grid;
        gap: 12px;
        margin-top: 22px;
      }
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 52px;
        border-radius: 14px;
        text-decoration: none;
        font-weight: 600;
        border: 1px solid var(--accent);
        background: var(--accent);
        color: white;
      }
      .secondary {
        background: transparent;
        color: var(--text);
        border-color: var(--border);
      }
      .hint {
        margin-top: 16px;
        font-size: 13px;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="badge">${accentColor === "#15803d" ? "✓" : "!"}</div>
      <h1>${title}</h1>
      <p>${subtitle}</p>
      <div class="actions">
        <a class="button" href="${deepLink}">${buttonLabel}</a>
        <button class="button secondary" type="button" onclick="window.close()">Close Browser</button>
      </div>
      <div class="hint">If the app does not open automatically, tap the button above.</div>
    </div>
    <script>
      setTimeout(function () {
        window.location.href = ${JSON.stringify(options.deepLink)};
      }, 300);
    </script>
  </body>
</html>`;
}
function buildDeepLink(req, status) {
    const scheme = (process.env.APP_RETURN_SCHEME || "fashionapp").trim();
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string" && value.trim().length > 0) {
            query.set(key, value.trim());
        }
    }
    query.set("status", status);
    return `${scheme}://payment/${status}?${query.toString()}`;
}
route.get("/payment/success", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(buildReturnPage({
        title: "Payment Confirmed",
        subtitle: "Your payment was received. Returning you to The Fashion App so the order status can refresh.",
        accentColor: "#15803d",
        deepLink: buildDeepLink(req, "success"),
        buttonLabel: "Return to App",
    }));
});
route.get("/payment/cancel", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(buildReturnPage({
        title: "Payment Cancelled",
        subtitle: "No charge was completed. Return to the app to try payment again or choose a different method.",
        accentColor: "#b45309",
        deepLink: buildDeepLink(req, "cancel"),
        buttonLabel: "Back to App",
    }));
});
exports.default = route;
