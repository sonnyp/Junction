import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Gdk from "gi://Gdk";
import Gio from "gi://Gio";

export function logEnum(obj, value) {
  log(
    Object.entries(obj).find(([k, v]) => {
      return v === value;
    })[0],
  );
}

export function relativePath(path) {
  const [filename] = GLib.filename_from_uri(import.meta.url);
  const dirname = GLib.path_get_dirname(filename);
  return GLib.canonicalize_filename(path, dirname);
}

export function loadStyleSheet(path) {
  const provider = new Gtk.CssProvider();
  provider.load_from_path(path);
  Gtk.StyleContext.add_provider_for_display(
    Gdk.Display.get_default(),
    provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
  );
}

export function spawn(cmd) {
  if (GLib.getenv("FLATPAK_ID")) {
    cmd = `flatpak-spawn --host ${cmd}`;
  }
  return GLib.spawn_command_line_async(cmd);
}

export function openWithApplication({ appInfo, uri, content_type }) {
  if (GLib.getenv("FLATPAK_ID")) {
    appInfo = flatpakSpawnify(appInfo);
  }

  const success = appInfo.launch_uris([uri], null);
  if (!success) {
    throw new Error(`Could not launch ${uri} with ${appInfo.get_id()}`);
  }

  if (!GLib.getenv("FLATPAK_ID") && content_type) {
    // On Flatpak fails with
    // (re.sonny.Junction:3): Gjs-WARNING **: 18:35:39.427: JS ERROR: Gio.IOErrorEnum: Can’t create user desktop file /home/sonny/.var/app/re.sonny.Junction/data/applications/userapp-YOGA Image Optimizer-20X240.desktop
    appInfo.set_as_last_used_for_type(content_type);
  }
}

function flatpakSpawnify(appInfo) {
  const filename = appInfo.get_filename();
  if (!filename) {
    return appInfo;
  }

  const keyFile = new GLib.KeyFile();
  if (!keyFile.load_from_file(filename, GLib.KeyFileFlags.NONE)) {
    return null;
  }

  const Exec = keyFile.get_value("Desktop Entry", "Exec");
  if (Exec.startsWith("flatpak-spawn")) {
    return null;
  }

  if (!Exec) {
    logError(new Error(`No Exec for ${filename}`));
    return null;
  }
  keyFile.set_value("Desktop Entry", "Exec", `flatpak-spawn --host ${Exec}`);

  return Gio.DesktopAppInfo.new_from_keyfile(keyFile);
}

export function getFileInfo(file) {
  const URI = GLib.uri_parse(file.get_uri(), GLib.UriFlags.NONE);

  let content_type = "application/octet-stream";
  // g_file_get_uri_scheme() returns http for https so we need to use g_uri
  const scheme = URI.get_scheme();
  if (scheme !== "file") {
    content_type = `x-scheme-handler/${scheme}`;
  } else {
    const info = file.query_info(
      "standard::content-type",
      Gio.FileQueryInfoFlags.NONE,
      null,
    );
    content_type = info.get_content_type();
  }

  return {
    content_type,
    URI,
  };
}
