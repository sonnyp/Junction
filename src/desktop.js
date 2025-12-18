import GLib from "gi://GLib";
import Gio from "gi://Gio";
import GioUnix from "gi://GioUnix";
import Xdp from "gi://Xdp";
import { prefixCommandLineForHost } from "./util.js";

// https://specifications.freedesktop.org/desktop-entry-spec/latest/

Gio._promisify(
  Gio.File.prototype,
  "enumerate_children_async",
  "enumerate_children_finish",
);

Gio._promisify(
  Gio.File.prototype,
  "load_contents_async",
  "load_contents_finish",
);

const excluded_apps = [
  // Exclude self for obvious reason
  "re.sonny.Junction.desktop",
  // Braus is similar to Junction
  "com.properlypurple.braus.desktop",
  // SpaceFM handles urls for some reason
  // https://github.com/properlypurple/braus/issues/26
  // https://github.com/IgnorantGuru/spacefm/blob/e6f291858067e73db44fb57c90e4efb97b088ac8/data/spacefm.desktop.in
  "spacefm.desktop",
];

let applications = [];

async function getApplicationsForDir(path) {
  const parent = Gio.File.new_for_path(path);

  const apps = [];

  let enumerator;
  try {
    enumerator = await parent.enumerate_children_async(
      `${Gio.FILE_ATTRIBUTE_STANDARD_NAME},${Gio.FILE_ATTRIBUTE_STANDARD_IS_HIDDEN},${Gio.FILE_ATTRIBUTE_STANDARD_TYPE}`,
      Gio.FileQueryInfoFlags.FOLLOW_SYMLINKS,
      GLib.PRIORITY_DEFAULT,
      null,
    );
  } catch (err) {
    if (err.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)) return apps;
    if (err.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_DIRECTORY))
      return apps;
    throw err;
  }

  for await (const file_info of enumerator) {
    if (file_info.get_is_hidden()) continue;
    if (file_info.get_file_type() !== Gio.FileType.REGULAR) continue;
    const name = file_info.get_name();
    if (!name.endsWith(".desktop")) continue;

    const file = enumerator.get_child(file_info);
    let app;

    try {
      app = await loadDesktopAppInfoFromFile(file);
    } catch (err) {
      console.error(err);
      continue;
    }

    apps.push(app);
  }

  return apps;
}

export async function loadApplications() {
  const home = GLib.get_home_dir();

  const paths = [
    // --filesystem=host:ro mounts home transparently in the sandbox
    GLib.build_filenamev([home, ".local/share/applications/"]),
    GLib.build_filenamev([
      home,
      ".local/share/flatpak/exports/share/applications/",
    ]),
    // --filesystem=/var/lib/flatpak:ro mounts it transparently in the sandbox
    "/var/lib/flatpak/exports/share/applications/",
    // --filesystem=/var/lib/snapd/desktop:ro mounts it transparently in the sandbox
    "/var/lib/snapd/desktop/applications/",
  ];

  if (Xdp.Portal.running_under_sandbox()) {
    paths.push(...["/run/host/usr/share/applications/"]);
  } else {
    paths.push(...["/usr/share/applications"]);
  }

  applications = (
    await Promise.all(paths.map((path) => getApplicationsForDir(path)))
  ).flat();
}

export async function init() {
  if (applications.length > 0) {
    return;
  }

  try {
    await loadApplications();
  } catch (err) {
    console.error(err);
  }
}

export function getApplications(content_type) {
  const apps = applications.filter((app) => {
    if (!app) return false;

    const mime = app.get_string_list(GLib.KEY_FILE_DESKTOP_KEY_MIME_TYPE);
    return mime.includes(content_type);
  });

  return apps;
}

console.log(
  Object.fromEntries(
    [
      "XDG_DATA_HOME",
      "XDG_DATA_DIRS",
      "HOST_XDG_DATA_HOME",
      "HOST_XDG_DATA_DIRS",
    ].map((key) => {
      return [key, GLib.getenv(key)];
    }),
  ),
);

async function loadDesktopAppInfoFromFile(file) {
  const [contents] = await file.load_contents_async(null);
  const keyfile = new GLib.KeyFile();
  const loaded = keyfile.load_from_bytes(contents, GLib.KeyFileFlags.NONE);
  if (!loaded) {
    throw new Error(`Could not load KeyFile from ${file.get_path()}`);
  }

  const app = loadDesktopAppInfo(keyfile);
  if (!app) {
    throw new Error(`Could not load DesktopAppInfo from ${file.get_path()}`);
  }

  // FIXME
  app.junction_id = app.get_name(); // no get_id() withn desktopappinfo built from keyfile
  app.junction_keyfile = keyfile; // no way to load keyfile from desktopappinfo without reading the file again
  app.junction_filename = file.get_path(); // no get_filename() with desktopappinfo built from keyfile

  if (app.get_nodisplay()) return null;
  if (excluded_apps.includes(app.junction_id)) return null;

  const mime = app.get_string_list(GLib.KEY_FILE_DESKTOP_KEY_MIME_TYPE);
  if (!mime || mime.length === 0) return null;

  return app;
}

function loadDesktopAppInfo(keyFile) {
  if (!Xdp.Portal.running_under_sandbox()) {
    return GioUnix.DesktopAppInfo.new_from_keyfile(keyFile);
  }

  let Exec;
  // https://github.com/sonnyp/Junction/issues/193#issuecomment-3469064246
  try {
    Exec = keyFile.get_value(
      GLib.KEY_FILE_DESKTOP_GROUP,
      GLib.KEY_FILE_DESKTOP_KEY_EXEC,
    );
    // eslint-disable-next-line no-empty
  } catch {}
  if (!Exec) return null;

  if (!Exec.startsWith("flatpak-spawn")) {
    keyFile.set_value("Desktop Entry", "Exec", prefixCommandLineForHost(Exec));
  }

  try {
    keyFile.remove_key(
      GLib.KEY_FILE_DESKTOP_GROUP,
      GLib.KEY_FILE_DESKTOP_KEY_TRY_EXEC,
    );
    // eslint-disable-next-line no-empty
  } catch {}

  return GioUnix.DesktopAppInfo.new_from_keyfile(keyFile);
}
