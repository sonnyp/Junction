import Gio from "gi://Gio";
import GLib from "gi://GLib";

// only needed in flatpak sandbox see https://github.com/flathub/com.github.donadigo.appeditor/issues/18
export function getFlatpakApplications(content_type) {
  return [
    ...getApplicationsForPath(
      "/var/lib/flatpak/exports/share/applications",
      content_type,
    ),
    ...getApplicationsForPath(
      GLib.build_filenamev([
        GLib.get_home_dir(),
        ".local/share/flatpak/exports/share/applications",
      ]),
      content_type,
    ),
  ];
}

function getApplicationsForPath(path, content_type) {
  const file = Gio.File.new_for_path(path);

  const en = file.enumerate_children(
    "standard::name",
    Gio.FileQueryInfoFlags.NONE,
    null,
  );

  const apps = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const fileInfo = en.next_file(null);
    if (!fileInfo) break;
    const name = fileInfo.get_name();
    if (!name.endsWith(".desktop")) continue;
    const path = GLib.build_filenamev([file.get_path(), fileInfo.get_name()]);
    const appInfo = flatpakAppInfo(path);
    if (!appInfo) continue;
    const types = appInfo.get_supported_types();
    if (!types) continue;
    if (
      !types.some((type) => {
        return (
          Gio.content_type_equals(type, content_type) ||
          Gio.content_type_is_a(content_type, type)
        );
      })
    ) {
      continue;
    }
    apps.push(appInfo);
  }

  return apps;
}

// Workaround - DesktopAppInfo.new_from_keyfile and DesktopAppInfo.new_from_filename
// return null if Exec path is not found
// https://gitlab.gnome.org/GNOME/glib/-/blob/132d64db4dff498863ec526eb3b360bf9e8e11e8/gio/gdesktopappinfo.c#L1758
// /usr/bin/flatpak is not available in the sandbox
// https://github.com/flathub/com.github.donadigo.appeditor/issues/18
// same applies to TryExec but I don't know if it's used and how
function flatpakAppInfo(path) {
  const keyFile = new GLib.KeyFile();
  if (!keyFile.load_from_file(path, GLib.KeyFileFlags.NONE)) {
    return null;
  }

  const flatpak_id = keyFile.get_value("Desktop Entry", "X-Flatpak");
  if (!flatpak_id) {
    logError(new Error(`No X-Flatpak for ${path}`));
    return null;
  }

  const Exec = keyFile.get_value("Desktop Entry", "Exec");
  if (!Exec) {
    logError(new Error(`No Exec for ${path}`));
    return null;
  }
  keyFile.set_value("Desktop Entry", "Exec", `flatpak-spawn --host ${Exec}`);

  const appInfo = Gio.DesktopAppInfo.new_from_keyfile(keyFile);
  if (!appInfo) {
    return null;
  }

  // Also required for dbus activation
  // https://gitlab.gnome.org/GNOME/glib/-/blob/ed49de8b0f1b7466676940d71e57641ddf2dcbc6/gio/gdesktopappinfo.c#L1893
  appInfo.get_id = function get_id() {
    return GLib.path_get_basename(path);
  };

  return appInfo;
}
