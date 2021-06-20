import "./setup.js";

import Gio from "gi://Gio";
import GLib from "gi://GLib";
import { programInvocationName } from "system";

import Application from "./application.js";

GLib.set_prgname("re.sonny.Junction");
GLib.set_application_name("Junction");

export default function main(argv, { version }) {
  const application = Application({ version });

  // if (__DEV__) {
  log("argv " + argv.join(" "));
  log(`programInvocationName: ${programInvocationName}`);
  log(`_: ${GLib.getenv("_")}`);
  log(`PWD: ${GLib.get_current_dir()}`);
  log(`XDG_DATA_DIRS ${GLib.getenv("XDG_DATA_DIRS")}`);
  log(`PATH ${GLib.getenv("PATH")}`);

  const restart = new Gio.SimpleAction({
    name: "restart",
    parameter_type: null,
  });
  restart.connect("activate", () => {
    application.quit();
    GLib.spawn_async(null, argv, null, GLib.SpawnFlags.DEFAULT, null);
  });
  application.add_action(restart);
  application.set_accels_for_action("app.restart", ["<Ctrl><Shift>Q"]);
  // }

  application.run(argv);
}
