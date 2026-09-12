import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as ClientOnly, t as ChartTooltip } from "./chart-tooltip-Bz03XC6r.mjs";
import { d as Card, f as CardContent, k as formatAxis, m as CardTitle, p as CardHeader, u as Skeleton } from "./routes-DuHhPS9Y.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, r as BarChart, s as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/income-expense-CpTzGucD.js
var import_jsx_runtime = require_jsx_runtime();
function IncomeExpense({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "stagger-in min-w-0",
		style: { animationDelay: "240ms" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Income vs expenses" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: data.every((d) => d.income === 0 && d.expense === 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: "No income or expenses in this range."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-64 w-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
				fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-full w-full" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data,
						margin: {
							top: 8,
							right: 8,
							left: 0,
							bottom: 0
						},
						children: [
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
								minTickGap: 24
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 11
								},
								tickLine: false,
								axisLine: false,
								width: 36,
								tickFormatter: (v) => formatAxis(v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: { fill: "var(--color-accent)" },
								content: ChartTooltip
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "income",
								name: "Income",
								fill: "var(--color-income)",
								radius: [
									4,
									4,
									0,
									0
								],
								maxBarSize: 18
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "expense",
								name: "Expenses",
								fill: "var(--color-expense)",
								radius: [
									4,
									4,
									0,
									0
								],
								maxBarSize: 18
							})
						]
					})
				})
			})
		}) })]
	});
}
//#endregion
export { IncomeExpense };
