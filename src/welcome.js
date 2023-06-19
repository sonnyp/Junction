import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";

import { build } from "../troll/src/main.js";

import { spawn_sync } from "./util.js";
import Interface from "./welcome.blp" assert { type: "uri" };

export default function Welcome({ application }) {
  const { window } = build(Interface, {
    onInstall() {
      const success = setAsDefaultApplicationForWeb();

      Gtk.show_uri(
        window,
        `https://junction.sonny.re/${success ? "success" : "error"}`,
        Gdk.CURRENT_TIME,
      );
    },
  });

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

// const types = [
//   "x-scheme-handler/http",
//   "x-scheme-handler/https",
//   "text/html",
//   "text/xml",
//   "application/xhtml+xml",
// ];
// for (const type of types) {
//   spawn(`gio mime ${type} re.sonny.Junction.desktop`);
// }
