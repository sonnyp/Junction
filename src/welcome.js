import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
// import Gdk from "gi://Gdk";

import { relativePath, spawn } from "./util.js";

export default function Welcome({ application }) {
  const builder = Gtk.Builder.new_from_file(relativePath("./welcome.ui"));

  const window = builder.get_object("welcome");
  if (__DEV__) window.add_css_class("devel");
  window.set_application(application);

  const test_button = builder.get_object("demo_button");
  test_button.connect("activate-link", () => {
    application.open([Gio.File.new_for_uri(test_button.uri)], "demo");
    return true;
  });

  const install_button = builder.get_object("install_button");
  install_button.connect("clicked", () => {
    // TODO: Show an Adw.Toast once it hits a release
    setAsDefaultApplicationForWeb();

    spawn("gnome-control-center default-apps");
    // Gtk.show_uri(
    //   window,
    //   "https://github.com/sonnyp/Junction",
    //   Gdk.CURRENT_TIME,
    // );
  });

  window.present();

  return { window };
}

function setAsDefaultApplicationForWeb() {
  spawn("gio mime x-scheme-handler/https re.sonny.Junction.desktop");
  spawn("gio mime x-scheme-handler/http re.sonny.Junction.desktop");
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
