import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";
import Gio from "gi://Gio";

import { build } from "../troll/src/main.js";
import ThemeSelector from "../troll/src/widgets/ThemeSelector.js";

import { spawn_sync } from "./util.js";
import { settings } from "./common.js";
import Interface from "./welcome.blp" with { type: "uri" };

export default function Welcome({ application }) {
  const { window, content_box, test_link, compact_switch, tray_switch } = build(Interface, {
    onApplications() {
      application.activate_action("arrange", null);
    },
    onInstall() {
      const success = setAsDefaultApplicationForWeb();

      Gtk.show_uri(
        window,
        `https://junction.sonny.re/${success ? "success" : "error"}`,
        Gdk.CURRENT_TIME,
      );
    },
  });

  content_box.insert_child_after(new ThemeSelector(), test_link);

  settings.bind("compact", compact_switch, "active", Gio.SettingsBindFlags.DEFAULT);
  settings.bind("show-tray", tray_switch, "active", Gio.SettingsBindFlags.DEFAULT);

  if (__DEV__) window.add_css_class("devel");
  window.set_application(application);

  window.present();

  return { window };
}

function setAsDefaultApplicationForWeb() {
  try {
    if (
      !spawn_sync(
        "gio mime x-scheme-handler/https re.sonny.Junction.desktop",
      ) ||
      !spawn_sync("gio mime x-scheme-handler/http re.sonny.Junction.desktop")
    )
      return false;
  } catch (err) {
    logError(err);
    return false;
  }
  return true;
}

const types = [
  "x-scheme-handler/http",
  "x-scheme-handler/https",
  "text/html",
  "text/xml",
  "application/xhtml+xml",
];
for (const type of types) {
  spawn_sync(`gio mime ${type} re.sonny.Junction.desktop`);
}
