import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

import Window from "./window.js";

export default function Application({ version }) {
  const application = new Gtk.Application({
    application_id: "re.sonny.Junction",
    flags: Gio.ApplicationFlags.HANDLES_OPEN,
  });

  application.connect("open", (self, [file]) => {
    Window({ application, file });
  });

  return application;
}
