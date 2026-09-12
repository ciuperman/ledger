import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { O as cn } from "./routes-DuHhPS9Y.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"data-slot": "label",
		className: cn("text-xs font-medium text-muted-foreground", className),
		...props
	});
}
//#endregion
export { Label as t };
