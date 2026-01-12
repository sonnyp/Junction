import GLib from "gi://GLib";
import Gio from "gi://Gio";

// https://specifications.freedesktop.org/desktop-entry-spec/latest/

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

export function getApplications(content_type) {
  const applications = Gio.AppInfo.get_recommended_for_type(content_type);

  const apps = [];

  for (const appInfo of applications) {
    if (excluded_apps.includes(appInfo.get_id())) continue;
    if (!appInfo.should_show()) continue;

    // For desktop actions
    // TODO: we don't need this before we actually run an action
    const filename = appInfo.get_filename();
    const keyFile = new GLib.KeyFile();
    keyFile.load_from_file(filename, GLib.KeyFileFlags.NONE);
    appInfo.keyfile = keyFile;

    apps.push(appInfo);
  }

  return apps;
}

// console.debug(
//   Object.fromEntries(
//     [
//       "HOST_XDG_DATA_HOME",
//       "HOST_XDG_CONFIG_HOME",
//       "HOST_XDG_CACHE_HOME",
//       "HOST_XDG_STATE_HOME",
//       "XDG_DATA_HOME",
//       "XDG_CONFIG_HOME",
//       "XDG_CACHE_HOME",
//       "XDG_STATE_HOME",
//       "XDG_DATA_DIRS",
//     ].map((key) => {
//       return [key, GLib.getenv(key)];
//     }),
//   ),
// );
