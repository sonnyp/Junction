import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
// import GLib from "gi://GLib";

import Window from "./window.js";

export default function Application({ version }) {
  const application = new Gtk.Application({
    application_id: "re.sonny.Junction",
    flags: Gio.ApplicationFlags.HANDLES_OPEN,
  });

  // Set Junction as the default application for http and https
  // is this user hostile?
  // It's probably what > 80% of users want by default but perhaps consider
  // a setting to turn this off
  // The flatpak story is unclear https://github.com/flatpak/xdg-desktop-portal/issues/126
  // setAsDefaultApplication();

  application.connect("open", (self, [file]) => {
    Window({ application, file });
  });

  // application.connect("activate", () => {
  //   Window({
  //     application,
  //     file: Gio.File.new_for_path(GLib.get_current_dir()),
  //   });
  // });

  const quit = new Gio.SimpleAction({
    name: "quit",
    parameter_type: null,
  });
  quit.connect("activate", () => {
    application.quit();
  });
  application.add_action(quit);
  application.set_accels_for_action("app.quit", ["<Ctrl>Q"]);

  const close = new Gio.SimpleAction({
    name: "close",
    parameter_type: null,
  });
  close.connect("activate", () => {
    application.get_active_window()?.close();
  });
  application.add_action(close);
  application.set_accels_for_action("app.close", ["<Ctrl>W", "Escape"]);

  return application;
}

// function setAsDefaultApplication() {
//   const appInfo = Gio.AppInfo.get_all().find((appInfo) => {
//     return appInfo.get_id() === "re.sonny.Junction.desktop";
//   });
//   if (appInfo) {
//     types.forEach((appInfo) => appInfo.set_as_default_for_type);
//   }
// }

// const types = [
//   "x-scheme-handler/http",
//   "x-scheme-handler/https",
//   "text/html",
//   "text/xml",
//   "application/xhtml+xml",
// ];
