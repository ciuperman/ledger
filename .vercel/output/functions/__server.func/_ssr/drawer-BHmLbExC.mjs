import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Drawer } from "../_libs/vaul.mjs";
import { O as cn } from "./routes-DuHhPS9Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/drawer-BHmLbExC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Drawer$1({ shouldScaleBackground = false, repositionInputs = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
		shouldScaleBackground,
		repositionInputs,
		...props
	});
}
function DrawerPortal({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Portal, { ...props });
}
function DrawerOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, {
		className: cn("fixed inset-0 z-50 bg-background/80", className),
		...props
	});
}
function useLiftForKeyboard(ref) {
	import_react.useEffect(() => {
		const vv = window.visualViewport;
		if (!vv) return;
		const apply = () => {
			const el = ref.current;
			if (!el) return;
			const inset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
			const keyboard = inset > 80 ? inset : 0;
			el.style.setProperty("--keyboard-inset", `${keyboard}px`);
			if (keyboard > 0) {
				el.style.maxHeight = `${Math.round(vv.height)}px`;
				el.style.marginTop = "0px";
			} else {
				el.style.maxHeight = "";
				el.style.marginTop = "";
			}
		};
		apply();
		vv.addEventListener("resize", apply);
		vv.addEventListener("scroll", apply);
		window.addEventListener("focusin", apply);
		return () => {
			vv.removeEventListener("resize", apply);
			vv.removeEventListener("scroll", apply);
			window.removeEventListener("focusin", apply);
		};
	}, [ref]);
}
function scrollFocusedField(target) {
	if (!(target instanceof HTMLElement)) return;
	if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") return;
	window.setTimeout(() => {
		target.scrollIntoView({
			block: "center",
			inline: "nearest",
			behavior: "smooth"
		});
	}, 280);
}
function DrawerContent({ className, children, onFocusCapture, ...props }) {
	const sheetRef = import_react.useRef(null);
	useLiftForKeyboard(sheetRef);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
		ref: sheetRef,
		className: cn("drawer-sheet fixed inset-x-0 bottom-0 z-50 mt-16 flex flex-col overflow-hidden rounded-t-2xl bg-card text-card-foreground shadow-[var(--shadow-border)] outline-none", className),
		...props,
		onFocusCapture: (e) => {
			onFocusCapture?.(e);
			scrollFocusedField(e.target);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border" }), children]
	})] });
}
function DrawerHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex shrink-0 flex-col gap-1 px-5 pt-4 pb-2", className),
		...props
	});
}
function DrawerTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
		className: cn("text-base font-medium", className),
		...props
	});
}
function DrawerDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Description, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function DrawerFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex shrink-0 flex-col gap-2 px-5 pt-2 safe-bottom", className),
		...props
	});
}
//#endregion
export { DrawerHeader as a, DrawerFooter as i, DrawerContent as n, DrawerTitle as o, DrawerDescription as r, Drawer$1 as t };
