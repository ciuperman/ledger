import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as ClientOnly, t as ChartTooltip } from "./chart-tooltip-Bz03XC6r.mjs";
import { d as Card, f as CardContent, k as formatAxis, m as CardTitle, p as CardHeader, u as Skeleton } from "./routes-DuHhPS9Y.mjs";
import { a as XAxis, d as ResponsiveContainer, f as Tooltip, i as YAxis, o as Area, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/balance-chart-DB2EIeay.js
var import_jsx_runtime = require_jsx_runtime();
function BalanceChart({ data, focused }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "stagger-in min-w-0",
		style: { animationDelay: "160ms" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: focused ? "Focused cumulative" : "Balance trend" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: data.every((d) => d.balance === 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: focused ? "No activity in this focus." : "No balance yet. Log a transaction to start the trend."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-64 w-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
				fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-full w-full" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
						data,
						margin: {
							top: 8,
							right: 8,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
								id: "balFill",
								x1: "0",
								y1: "0",
								x2: "0",
								y2: "1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: "var(--color-chart-line)",
									stopOpacity: .22
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: "var(--color-chart-line)",
									stopOpacity: 0
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--color-chart-grid)",
								vertical: false,
								strokeDasharray: "3 6"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "label",
								tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 11
								},
								tickLine: false,
								axisLine: false,
								minTickGap: 28
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 11
								},
								tickLine: false,
								axisLine: false,
								width: 36,
								tickFormatter: (v) => formatAxis(v),
								domain: [(min) => min - Math.max(Math.abs(min) * .05, 50), (max) => max + Math.max(Math.abs(max) * .05, 50)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: { stroke: "var(--color-border)" },
								content: ChartTooltip
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								type: "monotone",
								dataKey: "balance",
								name: "Balance",
								stroke: "var(--color-chart-line)",
								fill: "url(#balFill)",
								strokeWidth: 1.75,
								dot: false,
								activeDot: {
									r: 3,
									strokeWidth: 0,
									fill: "var(--color-primary)"
								}
							})
						]
					})
				})
			})
		}) })]
	});
}
//#endregion
export { BalanceChart };
