import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import GLib from "gi://GLib";

import { build } from "../troll/src/main.js";

import { readResource, openWithAction, sortApplications } from "./util.js";
import Entry from "./Entry.js";
import { expandProfiles } from "./profiles.js";
import AppButton, { ShowInFolderButton } from "./AppButton.js";
import AppOrderDialog from "./AppOrderDialog.js";
import { settings } from "./common.js";
import Interface from "./window.blp" with { type: "uri" };
import ThemeSelector from "../troll/src/widgets/ThemeSelector.js";

export default function Window({ application, file }) {
  const { window, list, entry, button_menu_top, button_menu_bottom } = build(Interface);
  button_menu_top.get_popover().add_child(new ThemeSelector(), "themeswitcher");
  button_menu_bottom.get_popover().add_child(new ThemeSelector(), "themeswitcher");

  if (__DEV__) window.add_css_class("devel");
  window.set_application(application);

  const { content_type, resource, scheme } = readResource(file);

  Entry({
    entry,
    resource,
    scheme,
  });

  const applications = getApplications(content_type);

  // Hidden applications are not offered at all
  function visibleApplications() {
    const hidden = settings.get_strv("hidden-apps");
    return sortApplications(
      applications.filter((appInfo) => !hidden.includes(appInfo.get_id())),
      settings.get_strv("app-order"),
    );
  }

  let options = [];

  function populate() {
    list.remove_all();
    options = visibleApplications().map((appInfo, position) =>
      AppButton({
        appInfo,
        content_type,
        entry,
        window,
        position,
      }),
    );

    if (
      scheme === "file" &&
      !["inode/directory", "application/octet-stream"].includes(content_type)
    ) {
      options.push(ShowInFolderButton({ file, entry, window }));
    }

    options.forEach((button) => {
      list.append(new Gtk.FlowBoxChild({ focusable: false, child: button }));
    });

    // The grid is as wide as its tiles, so it stays centered with few apps
    const count = Math.max(options.length, 1);
    list.max_children_per_line = Math.min(count, 5);
    list.min_children_per_line = Math.min(count, 3);
  }
  populate();

  function getButtonForKeyval(keyval) {
    // Top row digits are "1", the numeric keypad ones are "KP_1"
    const keyname = Gdk.keyval_name(keyval)?.replace(/^KP_/, "");
    // Is not 0...9
    if (!/^\d$/.test(keyname)) return null;
    const n = +keyname;
    return options[n === 0 ? 9 : n - 1];
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

  const reorder = new Gio.SimpleAction({
    name: "reorder",
    parameter_type: null,
  });
  reorder.connect("activate", () => {
    AppOrderDialog({
      applications: sortApplications(
        applications,
        settings.get_strv("app-order"),
      ),
      onChange: populate,
    });
  });
  reorder.enabled = applications.length > 1;
  window.add_action(reorder);

  const addRule = new Gio.SimpleAction({
    name: "add-rule",
    parameter_type: null,
  });
  addRule.connect("activate", () => {
    application.activate_action(
      "add-rule",
      new GLib.Variant("s", entry.get_text()),
    );
  });
  addRule.enabled = scheme === "http" || scheme === "https";
  window.add_action(addRule);

  function applyCompact() {
    const compact = settings.get_boolean("compact");
    // Room for three applications
    window.width_request = compact ? 360 : 480;
    window.set_default_size(compact ? 500 : 772, -1);
  }
  applyCompact();
  settings.connect("changed::compact", applyCompact);
  window.add_action(settings.create_action("compact"));
  window.add_action(settings.create_action("show-tray"));

  const toggleAppNames = settings.create_action("show-app-names");
  window.add_action(toggleAppNames);

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
    apps.push(...expandProfiles(appInfo));
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
