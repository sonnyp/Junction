import Gio from "gi://Gio";
import Adw from "gi://Adw";
import GLib from "gi://GLib";
import Xdp from "gi://Xdp";

import Window from "./window.js";
import Welcome from "./welcome.js";
import About from "./about.js";
import ShortcutsWindow from "./ShortcutsWindow.js";
import { init } from "./desktop.js";

import "./style.css";

const portal = new Xdp.Portal();

Gio._promisify(
  Xdp.Portal.prototype,
  "request_background",
  "request_background_finish",
);
Gio._promisify(
  Xdp.Portal.prototype,
  "set_background_status",
  "set_background_status_finish",
);

export default function Application() {
  const application = new Adw.Application({
    application_id: "re.sonny.Junction",
    flags: Gio.ApplicationFlags.HANDLES_OPEN,
  });
  // Prevent application from quitting if no windows are open
  application.hold();

  // https://gitlab.gnome.org/GNOME/glib/-/issues/1960
  // https://github.com/sonnyp/Junction/commit/5140f410ffd2899a3bb1aba5929f9891741e02fb
  if (Xdp.Portal.running_under_sandbox()) {
    GLib.spawn_command_line_async(
      "gio mime x-scheme-handler/https re.sonny.Junction.desktop",
    );
    GLib.spawn_command_line_async(
      "gio mime x-scheme-handler/http re.sonny.Junction.desktop",
    );
  }

  const initialize = Promise.withResolvers();

  application.connect("startup", () => {
    Adw.StyleManager.get_default().set_color_scheme(Adw.ColorScheme.FORCE_DARK);
    init().then(initialize.resolve).catch(initialize.reject);
  });

  // FIXME: Cannot deal with mailto:, xmpp:, ... URIs
  // GFile mess the URI if the scheme separator does not include "//" like about:blank or mailto:foo@bar.com
  // or plenty of other URI schemes https://en.wikipedia.org/wiki/List_of_URI_schemes
  // would be neat if there was a HANDLES_URI ApplicationFlags that used the new GLib URI
  // see https://gitlab.gnome.org/GNOME/glib/-/issues/1886
  // I tried working around the problem by using ApplicationFlags.COMMAND_LINE only
  // but the only way never to trigger open is to disable DBus activation altogether
  // see also https://gitlab.gnome.org/GNOME/glib/-/issues/1853
  application.connect("open", (self, files, hint) => {
    // log(["open", files.length, hint]);

    initialize.promise.then(() => {
      files.forEach((file) => {
        Window({
          application,
          file,
        });
      });
    });
  });

  let welcome;
  application.connect("activate", () => {
    if (!welcome) {
      welcome = Welcome({
        application,
      });
    }

    welcome.window.present();

    (async () => {
      // See https://github.com/sonnyp/Eloquent/issues/46
      // const parent = XdpGtk.parent_new_gtk(window);
      const parent = null;
      const success = await portal.request_background(
        parent,
        "Run Junction in the background to make it faster.",
        ["re.sonny.Junction", "--gapplication-service"],
        Xdp.BackgroundFlags.AUTOSTART,
        null,
      );
      console.debug("request background succeeded", success);
    })().catch(console.error);
  });

  application.connect("handle-local-options", (self, options) => {
    return options.contains("terminate_after_init") ? 0 : -1;
  });

  // This shouldn't be in the main options but rather in a "Development" group
  // unfortunally - I couldn't use OptionGroup
  // https://gitlab.gnome.org/GNOME/gjs/-/issues/448
  application.add_main_option(
    "terminate_after_init",
    null,
    GLib.OptionFlags.NONE,
    GLib.OptionArg.NONE,
    "Exit after initialization complete",
    null,
  );

  application.set_option_context_description("<https://junction.sonny.re>");
  application.set_option_context_parameter_string("[URI…]");
  // TODO: Add examples
  // application.set_option_context_summary("");

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
    About({ application });
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
