import Gio from "gi://Gio";
import GLib from "gi://GLib";
import { bindtextdomain, textdomain } from "gettext";
import Application from "./application.js";
import Adw from "gi://Adw";

GLib.set_prgname("re.sonny.Junction");
GLib.set_application_name("Junction");

export default function main(argv, { version, datadir }) {
  Adw.init();

  bindtextdomain(
    "re.sonny.Junction",
    GLib.build_filenamev([datadir, "locale"]),
  );
  textdomain("re.sonny.Junction");

  const application = Application({ version, datadir });

  if (__DEV__) {
    const restart = new Gio.SimpleAction({
      name: "restart",
      parameter_type: null,
    });
    restart.connect("activate", () => {
      application.quit();
      GLib.spawn_async(null, argv, null, GLib.SpawnFlags.DEFAULT, null);
    });
    application.add_action(restart);
    application.set_accels_for_action("app.restart", ["<Primary><Shift>Q"]);
  }

  application.run(argv);
}
