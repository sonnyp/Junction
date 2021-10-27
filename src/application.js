import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

import Window from "./window.js";
import Welcome from "./welcome.js";
import About from "./about.js";
import ShortcutsWindow from "./ShortcutsWindow.js";

export default function Application({ version }) {
  const application = new Gtk.Application({
    application_id: "re.sonny.Junction",
    flags: Gio.ApplicationFlags.HANDLES_OPEN,
  });

  Gtk.Settings.get_default()["gtk-application-prefer-dark-theme"] = true;

  application.connect("open", (self, files, hint) => {
    // GFile mess the URI if the scheme separator does not include "//" like about:blank or mailto:foo@bar.com
    // We could circumvent by using Gio.ApplicationFlags.HANDLES_COMMAND_LINE and ::command_line
    // instead of Gio.ApplicationFlags.HANDLES_OPEN and ::open
    // but we want to implement the dbus Open method as seen on
    // https://specifications.freedesktop.org/desktop-entry-spec/desktop-entry-spec-latest.html#dbus
    // so instead we read from ARGV directly
    log(ARGV);

    const [file] = files;
    Window({
      application,
      file,
    });
  });

  application.connect("activate", () => {
    Welcome({
      application,
    });
  });

  application.connect("handle_local_options", (self, options) => {
    log(["handle_local_options", options]);
    return -1;
  });

  application.connect("command_line", (self, command_line) => {
    log(["command_line", command_line]);
    // Welcome({
    //   application,
    // });
    return -1;
  });

  application.set_option_context_description(
    "<https://github.com/sonnyp/Junction>",
  );
  // TODO: Implement multiple resources
  // application.set_option_context_parameter_string("[RESOURCE…]");
  // Exec=re.sonny.Junction %U
  application.set_option_context_parameter_string("RESOURCE");
  application.set_option_context_summary(
    // TODO: Add examples
    "resource can be a path or URI",
  );

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
