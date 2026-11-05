import GLib from "gi://GLib";
import Gio from "gi://Gio";
import GioUnix from "gi://GioUnix";

import { getKeyFile } from "./util.js";

const home = GLib.get_home_dir();

const CHROMIUM_DIRS = {
  "google-chrome.desktop": ".config/google-chrome",
  "microsoft-edge.desktop": ".config/microsoft-edge",
  "chromium.desktop": ".config/chromium",
  "brave-browser.desktop": ".config/BraveSoftware/Brave-Browser",
};

const FIREFOX_IDS = ["firefox.desktop", "firefox_firefox.desktop"];
const FIREFOX_DIRS = [".mozilla/firefox", "snap/firefox/common/.mozilla/firefox"];

function readText(path) {
  try {
    const [, contents] = Gio.File.new_for_path(path).load_contents(null);
    return new TextDecoder().decode(contents);
  } catch {
    return null;
  }
}

function chromiumProfiles(dir) {
  const text = readText(`${home}/${dir}/Local State`);
  if (!text) return [];
  try {
    const cache = JSON.parse(text).profile?.info_cache ?? {};
    return Object.entries(cache).map(([directory, { name }]) => ({
      id: directory,
      name,
      args: `--profile-directory=${GLib.shell_quote(directory)}`,
    }));
  } catch {
    return [];
  }
}

// Newer Firefox keeps extra profiles out of profiles.ini, so scan the directories
function firefoxProfiles() {
  const profiles = [];
  for (const dir of FIREFOX_DIRS) {
    const root = `${home}/${dir}`;
    let enumerator;
    try {
      enumerator = Gio.File.new_for_path(root).enumerate_children(
        "standard::name,standard::type",
        Gio.FileQueryInfoFlags.NONE,
        null,
      );
    } catch {
      continue;
    }
    for (const info of enumerator) {
      const match = info.get_name().match(/^\w{8}\.(.+)$/);
      if (!match) continue;
      const path = `${root}/${info.get_name()}`;
      if (!GLib.file_test(`${path}/prefs.js`, GLib.FileTest.EXISTS)) continue;
      profiles.push({
        id: info.get_name(),
        name: match[1],
        args: `--profile ${GLib.shell_quote(path)}`,
      });
    }
  }
  return profiles.sort((a, b) => a.name.localeCompare(b.name));
}

function findProfiles(desktop_id) {
  if (desktop_id in CHROMIUM_DIRS) {
    return chromiumProfiles(CHROMIUM_DIRS[desktop_id]);
  }
  if (FIREFOX_IDS.includes(desktop_id)) return firefoxProfiles();
  return [];
}

function profileApp(appInfo, { id, name, args }) {
  const base = getKeyFile(appInfo);
  if (!base) return null;

  const keyFile = new GLib.KeyFile();
  const [data, length] = base.to_data();
  keyFile.load_from_data(data, length, GLib.KeyFileFlags.NONE);

  const group = GLib.KEY_FILE_DESKTOP_GROUP;
  const Exec = keyFile.get_string(group, GLib.KEY_FILE_DESKTOP_KEY_EXEC);
  // Flatpak style commands need the arguments in another place
  if (!/%[uU]/.test(Exec) || Exec.includes("@@")) return null;

  keyFile.set_string(
    group,
    GLib.KEY_FILE_DESKTOP_KEY_EXEC,
    Exec.replace(/%[uU]/, `${args} $&`),
  );
  // Drop translated names so the profile name is always shown
  const [keys] = keyFile.get_keys(group);
  keys
    .filter((key) => key.startsWith("Name["))
    .forEach((key) => keyFile.remove_key(group, key));
  keyFile.set_string(
    group,
    GLib.KEY_FILE_DESKTOP_KEY_NAME,
    `${appInfo.get_display_name()} – ${name}`,
  );

  const app = GioUnix.DesktopAppInfo.new_from_keyfile(keyFile);
  if (!app) return null;
  const app_id = `${appInfo.get_id()}::${id}`;
  Object.defineProperty(app, "get_id", { value: () => app_id });
  Object.defineProperty(app, "__keyFile", { value: keyFile, writable: true });
  return app;
}

// A browser with a single profile stays a single application
export function expandProfiles(appInfo) {
  const profiles = findProfiles(appInfo.get_id());
  if (profiles.length < 2) return [appInfo];

  const apps = profiles.map((profile) => profileApp(appInfo, profile));
  return apps.includes(null) ? [appInfo] : apps;
}

// Profiles Chromium and Firefox use for a plain launch
function isDefaultProfile(app_id) {
  const profile = app_id.split("::")[1] ?? "";
  return profile === "Default" || /^\w{8}\.default(-release)?$/.test(profile);
}

// A stored id may be stale when profiles were added or removed:
// "firefox" becomes its default profile, a removed profile falls back to
// the default one, or to the plain browser when it has a single profile
export function resolveApp(desktop_id, applications) {
  const exact = applications.find((app) => app.get_id() === desktop_id);
  if (exact) return exact;

  const browser = desktop_id.split("::")[0];
  const same = applications.filter(
    (app) => app.get_id().split("::")[0] === browser,
  );
  return same.find((app) => isDefaultProfile(app.get_id())) ?? same[0] ?? null;
}
