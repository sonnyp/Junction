import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import GLib from "gi://GLib";

import { build } from "../troll/src/main.js";

import { readResource, openWithAction } from "./util.js";
import Entry from "./Entry.js";
import AppButton, { ShowInFolderButton } from "./AppButton.js";
import { settings } from "./common.js";
import Interface from "./window.blp" with { type: "uri" };

const WINDOW_WIDTH = 772;
const WINDOW_HEIGHT = 218;
const WINDOW_WIDTH_COMPACT = 560;
// tile 80 + .list padding 2x6 + the 48px bottom bar, the way 218 is
// tile 134 + .list padding 2x12 + the bottom bar
const WINDOW_HEIGHT_COMPACT = 140;
const WINDOW_WIDTH_MIN = 360;

export default function Window({ application, file }) {
  const { window, list, entry } = build(Interface);

  if (__DEV__) window.add_css_class("devel");
  window.set_application(application);

  // The tiles shrink in compact mode, but the window keeps whatever size it
  // already has, so it is resized explicitly on top of the .compact styles.
  function applyCompact() {
    const compact = settings.get_boolean("compact");

    if (compact) window.add_css_class("compact");
    else window.remove_css_class("compact");

    window.set_size_request(
      WINDOW_WIDTH_MIN,
      compact ? WINDOW_HEIGHT_COMPACT : WINDOW_HEIGHT,
    );
    window.set_default_size(
      compact ? WINDOW_WIDTH_COMPACT : WINDOW_WIDTH,
      compact ? WINDOW_HEIGHT_COMPACT : WINDOW_HEIGHT,
    );
  }
  const compact_handler = settings.connect("changed::compact", applyCompact);
  window.connect("destroy", () => {
    settings.disconnect(compact_handler);
  });
  applyCompact();

  const { content_type, resource, scheme } = readResource(file);

  Entry({
    entry,
    resource,
    scheme,
  });

  const applications = getApplications(content_type);

  const options = [];

  applications.forEach((appInfo, index) => {
    const button = AppButton({
      appInfo,
      content_type,
      entry,
      window,
      position: index + 1,
    });
    appInfo.button = button;
    options.push(button);
    list.append(
      new Gtk.FlowBoxChild({
        focusable: false,
        child: button,
      }),
    );
  });

  if (
    scheme === "file" &&
    !["inode/directory", "application/octet-stream"].includes(content_type)
  ) {
    const button = ShowInFolderButton({
      file,
      entry,
      window,
      position: options.length + 1,
    });
    options.push(button);
    list.append(
      new Gtk.FlowBoxChild({
        focusable: false,
        child: button,
      }),
    );
  }

  function getButtonForKeyval(keyval) {
    const keyname = Gdk.keyval_name(keyval);
    // Is not 0...9, on the number row or on the numeric keypad
    const digit = /^(?:KP_)?(\d)$/.exec(keyname);
    if (!digit) return null;
    const n = +digit[1];
    return options[n - 1];
  }

  const eventController = new Gtk.EventControllerKey();
  eventController.connect("key-pressed", (self, keyval) => {
    const button = getButtonForKeyval(keyval);
    button?.grab_focus();
    return !!button;
  });
  eventController.connect("key-released", (self, keyval) => {
    const button = getButtonForKeyval(keyval);
    button?.activate();
    return !!button;
  });
  window.add_controller(eventController);

  function copyToClipboard() {
    const display = Gdk.Display.get_default();
    const clipboard = display.get_clipboard();
    clipboard.set(entry.get_text());
  }
  const copy = new Gio.SimpleAction({
    name: "copy",
    parameter_type: null,
  });
  copy.connect("activate", copyToClipboard);
  window.add_action(copy);

  const toggleAppNames = settings.create_action("show-app-names");
  window.add_action(toggleAppNames);

  const toggleCompact = settings.create_action("compact");
  window.add_action(toggleCompact);

  const run_action = new Gio.SimpleAction({
    name: "run_action",
    parameter_type: new GLib.VariantType("a{ss}"),
  });
  run_action.connect("activate", (self, variant) => {
    const data = variant.deep_unpack();
    const { desktop_id, action, location } = data;

    const appInfo = applications.find((app) => app.get_id() === desktop_id);
    if (!appInfo) return;
    const success = openWithAction({ appInfo, action, location });
    if (success) window.close();
  });
  window.add_action(run_action);

  window.present();

  return { window };
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

export function getApplications(content_type) {
  const applications = Gio.AppInfo.get_recommended_for_type(content_type);

  const apps = [];

  for (const appInfo of applications) {
    if (excluded_apps.includes(appInfo.get_id())) continue;
    if (!appInfo.should_show()) continue;
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
