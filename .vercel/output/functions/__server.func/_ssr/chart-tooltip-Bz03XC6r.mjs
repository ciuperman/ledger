import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { j as formatRon } from "./routes-DuHhPS9Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chart-tooltip-Bz03XC6r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ClientOnly({ children, fallback = null }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	if (!mounted) return fallback;
	return children;
}
function ChartTooltip({ active, payload, label, valueFormatter = formatRon }) {
	if (!active || !payload?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-popover px-3 py-2 text-xs shadow-[var(--shadow-border)]",
		children: [label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 text-muted-foreground",
			children: label
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-0.5",
			children: payload.map((item) => {
				const n = typeof item.value === "number" ? item.value : Number(item.value);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-6 tabular-nums text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-1.5 rounded-full",
							style: { background: item.color ?? "var(--color-primary)" }
						}), item.name]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: Number.isFinite(n) ? valueFormatter(n) : "—"
					})]
				}, String(item.dataKey ?? item.name));
			})
		})]
	});
}
//#endregion
export { ClientOnly as n, ChartTooltip as t };
