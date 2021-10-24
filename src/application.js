import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

import Window from "./window.js";
import Welcome from "./welcome.js";
import About from "./about.js";
import ShortcutsWindow from "./ShortcutsWindow.js";

import { getFileInfo } from "./util.js";
import { passThroughUserScript } from "./user.js";

export default function Application({ version }) {
  const application = new Gtk.Application({
    application_id: "re.sonny.Junction",
    flags: Gio.ApplicationFlags.HANDLES_OPEN,
  });

  Gtk.Settings.get_default()["gtk-application-prefer-dark-theme"] = true;

  application.connect("open", (self, [file]) => {
    const { URI, content_type } = getFileInfo(file);

    const handled = passThroughUserScript({ URI, content_type, file });
    if (handled === true) return;

    Window({ application, URI, content_type, file });
  });

  application.connect("activate", () => {
    Welcome({
      application,
    });
  });

  const quit = new Gio.SimpleAction({
    name: "quit",
    parameter_type: null,
  });
  quit.connect("activate", () => {
    application.quit();
  });
  application.add_action(quit);
  application.set_accels_for_action("app.quit", ["<Primary>Q"]);

  application.set_accels_for_action("window.close", ["<Primary>W", "Escape"]);
  application.set_accels_for_action("win.copy", ["<Primary>C"]);

  const showAboutDialog = new Gio.SimpleAction({
    name: "about",
    parameter_type: null,
  });
  showAboutDialog.connect("activate", () => {
    About({ application, version });
  });
  application.add_action(showAboutDialog);

  const showShortCutsWindow = new Gio.SimpleAction({
    name: "shortcuts",
    parameter_type: null,
  });
  showShortCutsWindow.connect("activate", () => {
    ShortcutsWindow({ application });
  });
  application.add_action(showShortCutsWindow);
  application.set_accels_for_action("app.shortcuts", ["<Primary>question"]);

  return application;
}
