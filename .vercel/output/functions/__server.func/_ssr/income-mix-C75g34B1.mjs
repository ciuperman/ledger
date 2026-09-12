import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as ClientOnly, t as ChartTooltip } from "./chart-tooltip-Bz03XC6r.mjs";
import { O as cn, d as Card, f as CardContent, j as formatRon, m as CardTitle, p as CardHeader, u as Skeleton } from "./routes-DuHhPS9Y.mjs";
import { d as ResponsiveContainer, f as Tooltip, l as Pie, n as PieChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/income-mix-C75g34B1.js
var import_jsx_runtime = require_jsx_runtime();
function IncomeMix({ data, focus, onFocus }) {
	const total = data.reduce((s, d) => s + d.value, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "stagger-in min-w-0",
		style: { animationDelay: "220ms" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Income by payee" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: "No income in this range. Add income to see who paid you."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto h-52 w-full max-w-xs overflow-hidden outline-none [&_svg]:outline-none",
				style: { WebkitTapHighlightColor: "transparent" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mx-auto size-52 rounded-full" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
							data,
							dataKey: "value",
							nameKey: "label",
							innerRadius: "62%",
							outerRadius: "88%",
							paddingAngle: 1.5,
							stroke: "none",
							isAnimationActive: false,
							activeShape: false,
							onClick: (_, index) => {
								const slice = data[index];
								if (slice) onFocus(slice.payee);
							},
							style: {
								cursor: "pointer",
								outline: "none"
							},
							children: data.map((slice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								fill: slice.color,
								stroke: "none",
								opacity: focus && focus.toLowerCase() !== slice.payee.toLowerCase() ? .28 : 1
							}, slice.payee))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							content: ChartTooltip,
							cursor: false,
							wrapperStyle: { outline: "none" }
						})] })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Income"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-sm tabular-nums text-foreground",
						children: formatRon(total)
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: data.slice(0, 6).map((slice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onFocus(slice.payee),
					className: cn("flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors duration-150 hover:bg-accent", focus && focus.toLowerCase() === slice.payee.toLowerCase() && "bg-accent"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2 shrink-0 rounded-full",
							style: { background: slice.color }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm",
							children: slice.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 font-mono text-xs tabular-nums whitespace-nowrap text-muted-foreground",
							children: [(slice.share * 100).toFixed(0), "%"]
						})
					]
				}) }, slice.payee))
			})]
		}) })]
	});
}
//#endregion
export { IncomeMix };
