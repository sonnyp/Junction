import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

import Window from "./window.js";
import Welcome from "./welcome.js";
import About from "./about.js";

export default function Application({ version }) {
  const application = new Gtk.Application({
    application_id: "re.sonny.Junction",
    flags: Gio.ApplicationFlags.HANDLES_OPEN,
  });

  application.connect("open", (self, [file]) => {
    Window({ application, file });
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
  application.set_accels_for_action("app.quit", ["<Ctrl>Q"]);

  application.set_accels_for_action("win.close", ["<Ctrl>W", "Escape"]);

  const showAboutDialog = new Gio.SimpleAction({
    name: "about",
    parameter_type: null,
  });
  showAboutDialog.connect("activate", () => {
    About({ application, version });
  });
  application.add_action(showAboutDialog);

  return application;
}
