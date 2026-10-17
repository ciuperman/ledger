import type { LocationRewrite } from "@tanstack/react-router";

/**
 * Path-based preview hosts serve the dev server under `/{port_id}/` and strip
 * that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
 * prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
 * client routing and generated links aligned with the public URL.
 */
const PATH_BASED_PREVIEW_HOSTS = new Set([
  "preview.grok.genai.mil",
  "preview.grok.mil",
  "preview.grokgsac.com",
]);

const PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;

function isPathPreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase().split(":")[0] ?? "";
  if (PATH_BASED_PREVIEW_HOSTS.has(host)) return true;
  // Live previews are served on *.grok.me under /hds-…/. Without the prefix,
  // /api/scan-receipt hits the gateway and comes back as a Cloudflare 502 page.
  return host === "grok.me" || host.endsWith(".grok.me");
}

export function previewPathPrefix(hostname: string, pathname: string): string | undefined {
  if (!isPathPreviewHost(hostname)) return undefined;
  return PORT_ID_PREFIX.exec(pathname)?.[0];
}

export function prefixRewrite(prefix: string): LocationRewrite {
  return {
    input: ({ url }) => {
      if (url.pathname === prefix) url.pathname = "/";
      else if (url.pathname.startsWith(`${prefix}/`))
        url.pathname = url.pathname.slice(prefix.length);
      return url;
    },
    output: ({ url }) => {
      url.pathname = `${prefix}${url.pathname}`;
      return url;
    },
  };
}

export function previewPathRewrite(): LocationRewrite | undefined {
  if (typeof window === "undefined") return undefined;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
  return prefix ? prefixRewrite(prefix) : undefined;
}

/** Absolute app paths must keep the preview port prefix, or fetch/forms 404. */
export function withPreviewPrefix(path: string): string {
  if (typeof window === "undefined") return path;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
  if (!prefix) return path;
  const queryAt = path.indexOf("?");
  const pathname = queryAt === -1 ? path : path.slice(0, queryAt);
  const search = queryAt === -1 ? "" : path.slice(queryAt);
  const base = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${prefix}${base}${search}`;
}
