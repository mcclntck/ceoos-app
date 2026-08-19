/** Thin wrapper around the Google tag (gtag.js) loaded in index.html. Every
 *  export no-ops silently if `gtag` isn't present — env var unset locally, an
 *  ad-blocker, or the script simply hasn't finished loading yet — matching this
 *  app's existing fail-silent philosophy (see netlify/functions/chat.ts) rather
 *  than ever throwing or blocking the UI over analytics. */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/** Reports a pageview for the given path. index.html's initial gtag config
 *  passes send_page_view: false, so this is the ONLY source of pageviews —
 *  call it once per React Router navigation (see AnalyticsRouteTracker in
 *  App.tsx), not just on the very first load. */
export function trackPageView(path: string): void {
  window.gtag?.('event', 'page_view', { page_path: path })
}

/** Reports a custom GA4 event, e.g. trackEvent('chat_completed', { deptId }). */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  window.gtag?.('event', name, params)
}
