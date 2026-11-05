import GLib from "gi://GLib";
import { gettext as _ } from "gettext";

import { settings } from "./common.js";
import { getApplications } from "./window.js";
import { resolveApp } from "./profiles.js";

// "domain" matches the host and its subdomains
export const MATCH_TYPES = [
  { id: "domain", label: _("Domain") },
  { id: "contains", label: _("Contains") },
  { id: "exact", label: _("Exact URL") },
  { id: "regex", label: _("Regex") },
];

export function getRules() {
  return settings.get_value("rules").deepUnpack();
}

export function saveRules(rules) {
  settings.set_value("rules", new GLib.Variant("a(sss)", rules));
}

export function isValidPattern(type, pattern) {
  if (type !== "regex") return true;
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

function matches(type, pattern, url) {
  switch (type) {
    case "domain": {
      const host = getHost(url);
      const domain = pattern.toLowerCase();
      return host === domain || host.endsWith(`.${domain}`);
    }
    case "contains":
      return url.includes(pattern);
    case "exact":
      return url === pattern;
    case "regex":
      return isValidPattern(type, pattern) && new RegExp(pattern).test(url);
    default:
      return false;
  }
}

export function getHost(url) {
  try {
    return GLib.Uri.parse(url, GLib.UriFlags.NONE).get_host()?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

export function findRuleApp(url) {
  const applications = getApplications("x-scheme-handler/https");

  for (const [type, pattern, desktop_id] of getRules()) {
    if (!pattern.trim() || !matches(type, pattern.trim(), url)) continue;
    const appInfo = resolveApp(desktop_id, applications);
    if (appInfo) return appInfo;
  }

  return null;
}
