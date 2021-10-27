import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

import Window from "./window.js";
import Welcome from "./welcome.js";
import About from "./about.js";
import ShortcutsWindow from "./ShortcutsWindow.js";

export default function Application({ version }) {
  const application = new Gtk.Application({
    application_id: "re.sonny.Junction",
    flags:
      Gio.ApplicationFlags.HANDLES_OPEN |
      Gio.ApplicationFlags.HANDLES_COMMAND_LINE,
  });

  Gtk.Settings.get_default()["gtk-application-prefer-dark-theme"] = true;

  // If both HANDLES_OPEN and HANDLES_COMMAND_LINE flags are set
  // this is only called for the DBus Open method
  // see https://gitlab.gnome.org/GNOME/glib/-/issues/1853
  application.connect("open", (self, files, hint) => {
    log(["open", files.length, hint]);
    // FIXME: Cannot deal with mailto:, xmpp:/, ... URIs
    // GFile mess the URI if the scheme separator does not include "//" like about:blank or mailto:foo@bar.com
    // or plenty of other URI schemes https://en.wikipedia.org/wiki/List_of_URI_schemes
    // would be neat if there was a HANDLES_URI ApplicationFlags that used the new GLib URI
    // see https://gitlab.gnome.org/GNOME/glib/-/issues/1886

    const [file] = files;
    Window({
      application,
      file,
    });
  });

  application.connect("command_line", (self, applicationCommandLine) => {
    const args = applicationCommandLine.get_arguments();
    const [, resource] = args;

    if (resource) {
      Window({
        application,
        file: applicationCommandLine.create_file_for_arg(resource),
      });
    }

    return -1;
  });

  application.connect("activate", () => {
    Welcome({
      application,
    });
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
