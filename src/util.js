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

export function parse(str) {
  if (str === "~" || str.startsWith("~/")) {
    str = Gio.File.parse_name(str).get_uri();
  } else if (str.startsWith("/")) {
    str = "file://" + str;
  }
  return GLib.Uri.parse(str, GLib.UriFlags.NONE);
}
