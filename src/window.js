import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gdk from "gi://Gdk";

import { relativePath, loadStyleSheet } from "./util.js";
import Entry from "./Entry.js";
import AppButton from "./AppButton.js";
import { getFlatpakApplications } from "./flatpak.js";

export default function Window({ application, file }) {
  const builder = Gtk.Builder.new_from_file(relativePath("./window.ui"));

  function copyToClipboard() {
    const display = Gdk.Display.get_default();
    const clipboard = display.get_clipboard();
    clipboard.set(entry.get_text());
  }

  const window = builder.get_object("window");
  loadStyleSheet(relativePath("./window.css"));
  window.set_application(application);

  let content_type = "application/octet-stream";
  let value = "";

  // g_file_get_uri_scheme() returns http for https so we need to use g_uri
  // const scheme = file.get_uri_scheme();
  const uri = GLib.uri_parse(file.get_uri(), GLib.UriFlags.NONE);
  const scheme = uri.get_scheme();

  if (scheme !== "file") {
    content_type = `x-scheme-handler/${scheme}`;
    value = file.get_uri();
  } else {
    value = file.get_path();
    try {
      const info = file.query_info(
        "standard::content-type,standard::display-name",
        Gio.FileQueryInfoFlags.NONE,
        null,
      );
      content_type = info.get_content_type();
      // display_name = info.get_display_name();
    } catch (err) {
      // display_name = file.get_basename();
      logError(err);
    }
  }

  const { entry } = Entry({
    entry: builder.get_object("entry"),
    value,
    scheme,
    copyToClipboard,
  });

  const applications = getApplications(content_type);
  log(applications.map((appInfo) => appInfo.get_name()));
  const list = builder.get_object("list");

  applications.forEach((appInfo) => {
    const { button } = AppButton({
      appInfo,
      content_type,
      entry,
      window,
    });
    list.append(button);
  });

  const shortcut = new Gtk.Shortcut({
    trigger: Gtk.ShortcutTrigger.parse_string("<Control>C"),
    action: Gtk.CallbackAction.new(copyToClipboard),
  });
  const shortcutController = new Gtk.ShortcutController();
  shortcutController.add_shortcut(shortcut);
  window.add_controller(shortcutController);
  window.present();

  function addResource(resource) {
    const entry = new Gtk.Entry({
      "input-purpose": "url",
      xalign: 0.5,
      "primary-icon-activatable": false,
      "primary-icon-tooltip-text":
        "This site has no security. An attacker could see any information you send, or control the content that you see.",
      "secondary-icon-name": "edit-copy-symbolic",
      "secondary-icon-tooltip-text": "Copy to Clipboard",
    });
    Entry({
      entry,
      value: resource,
      scheme,
      copyToClipboard,
    });
    return entry;
  }

  const close = new Gio.SimpleAction({
    name: "close",
    parameter_type: null,
  });
  close.connect("activate", () => {
    application.get_active_window()?.close();
  });
  window.add_action(close);

  return { window, addResource };
}

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

function getApplications(content_type) {
  let applications;

  if (GLib.getenv("FLATPAK_ID")) {
    applications = [
      ...new Map(
        [
          ...Gio.AppInfo.get_recommended_for_type(content_type),
          ...getFlatpakApplications(content_type),
        ].map((app) => [app.get_id(), app]),
      ).values(),
    ];
  } else {
    applications = Gio.AppInfo.get_recommended_for_type(content_type);
  }

  return applications.filter((appInfo) => {
    return appInfo.should_show() && !excluded_apps.includes(appInfo.get_id());
  });
}
