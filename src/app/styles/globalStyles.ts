import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html[data-theme="light"] {
    --rt-bg-page: #ffffff;
    --rt-bg-card: #ffffff;
    --rt-bg-sidebar: #f8f8fc;
    --rt-bg-input: #f9fafb;
    --rt-bg-topbar: #7700ff;
    --rt-bg-topbar-shadow: 0 0 8px 0 rgba(88,93,105,0.10), 0 2px 4px 0 rgba(88,93,105,0.05);
    --rt-bg-table-head: #f9fafb;
    --rt-text-primary: #19191b;
    --rt-text-secondary: #585d69;
    --rt-text-muted: #667085;
    --rt-text-on-topbar: #ffffff;
    --rt-border: rgba(0, 0, 0, 0.08);
    --rt-border-table: #eaecf0;
    --rt-border-input: #d0d5dd;
    --rt-accent: #7700ff;
    --rt-accent-hover: #5e00cc;
    --rt-nav-text: rgba(25, 25, 27, 0.65);
    --rt-nav-hover-bg: rgba(0, 0, 0, 0.03);
    --rt-nav-active-bg: #f3e8ff;
    --rt-nav-active-text: #7700ff;
    --rt-card-shadow: 0 0 8px 0 rgba(88,93,105,0.10), 0 2px 4px 0 rgba(88,93,105,0.05);
    --rt-dropdown-bg: #ffffff;
    --rt-dropdown-shadow: 0 0 16px 0 rgba(88,93,105,0.10), 0 4px 8px 0 rgba(88,93,105,0.05);
    --rt-badge-success-bg: #dcfce7;
    --rt-badge-success-text: #16a34a;
    --rt-badge-success-border: #bbf7d0;
    --rt-badge-error-bg: #fee2e2;
    --rt-badge-error-text: #dc2626;
    --rt-badge-error-border: #fecaca;
    --rt-badge-purple-bg: #f3e8ff;
    --rt-badge-purple-text: #7700ff;
    --rt-stat-icon-purple-bg: #f3e8ff;
    --rt-stat-icon-orange-bg: #ffedd5;
    --rt-stat-icon-yellow-bg: #fef9c3;
    --rt-stat-icon-green-bg: #dcfce7;
    --rt-modal-bg: #ffffff;
    --rt-btn-secondary-bg: #f2f4f7;
    --rt-btn-secondary-text: #344054;
    --rt-btn-secondary-border: #d0d5dd;
    --rt-page-outside-bg: #f2f4f7;
  }

  html[data-theme="dark"] {
    --rt-bg-page: #111621;
    --rt-bg-card: #151d2c;
    --rt-bg-sidebar: #0e1420;
    --rt-bg-input: #1c2236;
    --rt-bg-topbar: #1e0a42;
    --rt-bg-topbar-shadow: 0 4px 12px 0 rgba(0,0,0,0.4), 0 1px 2px 0 rgba(0,0,0,0.3);
    --rt-bg-table-head: #131926;
    --rt-text-primary: #e8e8f0;
    --rt-text-secondary: #9ea2ad;
    --rt-text-muted: #6b7280;
    --rt-text-on-topbar: #ffffff;
    --rt-border: rgba(255, 255, 255, 0.07);
    --rt-border-table: rgba(255, 255, 255, 0.08);
    --rt-border-input: rgba(255, 255, 255, 0.12);
    --rt-accent: #a855f7;
    --rt-accent-hover: #c084fc;
    --rt-nav-text: rgba(232, 232, 240, 0.55);
    --rt-nav-hover-bg: rgba(255, 255, 255, 0.04);
    --rt-nav-active-bg: rgba(168, 85, 247, 0.12);
    --rt-nav-active-text: #c084fc;
    --rt-card-shadow: 0 4px 12px 0 rgba(0,0,0,0.4), 0 1px 2px 0 rgba(0,0,0,0.3);
    --rt-dropdown-bg: #1c2236;
    --rt-dropdown-shadow: 0 8px 24px 0 rgba(0,0,0,0.5), 0 2px 4px 0 rgba(0,0,0,0.3);
    --rt-badge-success-bg: rgba(10, 203, 91, 0.12);
    --rt-badge-success-text: #0acb5b;
    --rt-badge-success-border: rgba(10, 203, 91, 0.20);
    --rt-badge-error-bg: rgba(255, 38, 38, 0.12);
    --rt-badge-error-text: #ff6b6b;
    --rt-badge-error-border: rgba(255, 38, 38, 0.20);
    --rt-badge-purple-bg: rgba(168, 85, 247, 0.12);
    --rt-badge-purple-text: #c084fc;
    --rt-stat-icon-purple-bg: rgba(168, 85, 247, 0.15);
    --rt-stat-icon-orange-bg: rgba(251, 146, 60, 0.15);
    --rt-stat-icon-yellow-bg: rgba(202, 138, 4, 0.15);
    --rt-stat-icon-green-bg: rgba(22, 163, 74, 0.15);
    --rt-modal-bg: #1c2236;
    --rt-btn-secondary-bg: rgba(255, 255, 255, 0.06);
    --rt-btn-secondary-text: #e8e8f0;
    --rt-btn-secondary-border: rgba(255, 255, 255, 0.12);
    --rt-page-outside-bg: #0b0f1a;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--rt-text-primary);
    background-color: var(--rt-bg-page);
    transition: background-color 0.2s ease, color 0.2s ease;
  }
`;

