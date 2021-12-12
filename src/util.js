import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Gdk from "gi://Gdk";
import Gio from "gi://Gio";
import system from "system";

const { byteArray } = imports;

export function logEnum(obj, value) {
  console.log(
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

export function spawn_sync(cmd) {
  if (GLib.getenv("FLATPAK_ID")) {
    cmd = `flatpak-spawn --host "${cmd}"`;
  }
  return GLib.spawn_command_line_sync(cmd);
}

export function spawn(cmd) {
  if (GLib.getenv("FLATPAK_ID")) {
    cmd = `flatpak-spawn --host "${cmd}"`;
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

export function getGIRepositoryVersion(repo) {
  const {
    get_major_version = () => "?",
    get_minor_version = () => "?",
    get_micro_version = () => "?",
  } = repo;
  return `${get_major_version()}.${get_minor_version()}.${get_micro_version()}`;
}

export function getGLibVersion() {
  return `${GLib.MAJOR_VERSION}.${GLib.MINOR_VERSION}.${GLib.MICRO_VERSION}`;
}

export function getGjsVersion() {
  const v = system.version.toString();
  return `${v[0]}.${+(v[1] + v[2])}.${+(v[3] + v[4])}`;
}

export function getOSRelease() {
  const regexp = /([A-Z][A-Z_0-9]+)=(.*)/;

  function load(path) {
    try {
      const file = Gio.File.new_for_path(path);
      const [, content] = file.load_contents(null);
      return byteArray.toString(content);
    } catch (err) {
      if (err.code !== Gio.IOErrorEnum.NOT_FOUND) {
        logError(err);
      }
    }
  }

  const prefix = GLib.getenv("FLATPAK_ID") ? "/run/host" : "";

  const value =
    load(`${prefix}/etc/os-release`) ||
    load(`${prefix}/usr/lib/os-release`) ||
    "";

  const os_release = {
    NAME: "Linux",
    ID: "Linux",
    PRETTY_NAME: "Linux",
  };

  const lines = value.split("\n");
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;
    // eslint-disable-next-line prefer-const
    let [, key, value] = line.match(regexp);
    value = GLib.shell_unquote(value);
    os_release[key] = value;
  }

  return os_release;
}

export function getFlatpakInfo() {
  const keyFile = new GLib.KeyFile();
  try {
    keyFile.load_from_file("/.flatpak-info", GLib.KeyFileFlags.NONE);
  } catch (err) {
    if (err.code !== GLib.FileError.NOENT) {
      logError(err);
    }
    return null;
  }
  return keyFile;
}

export function readResource(file) {
  if (file.has_uri_scheme("x-junction")) {
    const uri = file
      .get_uri()
      .split("x-junction://")[1]
      .replace("file:0//", "file:///")
      .replace(":0//", "://");
    if (uri.startsWith("~/")) {
      file = Gio.File.parse_name(uri);
    } else {
      file = Gio.File.new_for_commandline_arg(uri);
    }
  }

  let content_type = "application/octet-stream";
  const resource = file.get_parse_name();

  // g_file_get_uri_scheme() returns http for https so we need to use g_uri
  // g_file_get_parse_name() does not so it may be a bug
  // const scheme = file.get_uri_scheme();
  // console.log(file.get_uri_scheme())
  const uri = GLib.uri_parse(file.get_uri(), GLib.UriFlags.NONE);
  const scheme = uri.get_scheme();

  if (scheme !== "file") {
    content_type = `x-scheme-handler/${scheme}`;
  } else {
    try {
      const info = file.query_info(
        "standard::content-type",
        Gio.FileQueryInfoFlags.NONE,
        null,
      );
      content_type = info.get_content_type();
    } catch (err) {
      logError(err);
    }
  }

  return { resource, scheme, content_type };
}

// https://gitlab.gnome.org/GNOME/gjs/-/merge_requests/696
export const stdout = (() => {
  const { DataOutputStream, UnixOutputStream } = imports.gi.Gio;
  return new DataOutputStream({
    base_stream: new UnixOutputStream({ fd: 1 }),
  });
})();
export const stderr = (() => {
  const { DataOutputStream, UnixOutputStream } = imports.gi.Gio;
  return new DataOutputStream({
    base_stream: new UnixOutputStream({ fd: 2 }),
  });
})();
export const stdin = (() => {
  const { DataInputStream, UnixInputStream } = imports.gi.Gio;
  return new DataInputStream({
    base_stream: new UnixInputStream({ fd: 0 }),
  });
})();
// const source = stdin.base_stream.create_source(null);
// source.set_callback(() => {
//   log("foo");
// });
// source.attach(null);
