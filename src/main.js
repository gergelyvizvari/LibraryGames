import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { applyTheme, loadTheme } from './kit/theme';
import { App } from './shell/App';
import './styles.css';
// Before the first render, so the page never flashes the wrong theme.
applyTheme(loadTheme());
createRoot(document.getElementById('root')).render(_jsxs(StrictMode, { children: [_jsx(App, {}), _jsx(Analytics, {}), _jsx(SpeedInsights, {})] }));
