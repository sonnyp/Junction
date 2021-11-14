import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";

import {
  parse,
  relativePath,
  // spawn
} from "./util.js";
import { settings } from "./common.js";

const { byteArray } = imports;

const [, content] = GLib.file_get_contents(relativePath("./AppButton.ui"));
const template = byteArray.toString(content);

export default function AppButton({ appInfo, content_type, entry, window }) {
  const builder = Gtk.Builder.new_from_string(template, template.length);

  const button = builder.get_object("button");

  const name = appInfo.get_name();
  button.set_tooltip_text(name);
  const label = builder.get_object("label");
  label.label = name;
  label.visible = false;
  settings.bind(
    "show-app-names",
    label,
    "visible",
    Gio.SettingsBindFlags.DEFAULT,
  );

  const filename = appInfo.get_filename();
  const keyFile = new GLib.KeyFile();
  keyFile.load_from_file(filename, GLib.KeyFileFlags.NONE);
  const desktopAppInfo = Gio.DesktopAppInfo.new_from_keyfile(keyFile);
  const actions = desktopAppInfo.list_actions();

  const menu = new Gio.Menu();
  const popoverMenu = Gtk.PopoverMenu.new_from_model(menu);

  actions.forEach((action) => {
    const Exec = keyFile.get_string(`Desktop Action ${action}`, "Exec");
    const name = desktopAppInfo.get_action_name(action);
    // if (!Exec.includes("%u")) return;
    log([action, name, Exec]);

    menu.append(name, "foo");

    // spawn(Exec.replace("%u", `"${entry.get_text()}"`));
    // spawn(
    //   `gapplication action ${appInfo.get_id()} ${action} '"${entry.get_text()}"'`,
    // );
    // exec flatpak-spawn --host ${Exec}
  });
  // gapplication action chromium.desktop new-window '"http://foobar.com"'

  builder.get_object("box").append(popoverMenu);

  const icon = appInfo.get_icon();
  if (icon) {
    builder.get_object("image").set_from_gicon(icon);
  }

  function open() {
    try {
      openWithApplication({
        appInfo,
        location: entry.get_text(),
        content_type,
      });
      return true;
    } catch (err) {
      logError(err);
      return false;
    }
  }

  // Ctrl+Click should not close Junction
  // but it's not possible to do that with GtkButton
  // I was told to implement my own widget and do the following
  // const eventController = new Gtk.GestureClick();
  // widget.add_controller(eventController);
  // eventController.connect("released", () => {
  //   const evt = eventController.get_current_event();
  //   const modifier_state = evt.get_modifier_state();
  //   // Ctrl click
  //   if (modifier_state & Gdk.ModifierType.CONTROL_MASK) return;
  //   window.close();
  // });
  // but I'm too lazy ATM to implement a custom widget for this
  button.connect("clicked", () => {
    const success = open();
    if (success) window.close();
  });

  const eventController = new Gtk.GestureSingle({
    button: Gdk.BUTTON_MIDDLE,
  });
  eventController.connect("end", () => {
    open();
  });
  button.add_controller(eventController);

  const eventController2 = new Gtk.GestureSingle({
    button: Gdk.BUTTON_SECONDARY,
  });
  button.add_controller(eventController2);
  eventController2.connect("end", (self) => {
    log("cool");
    popoverMenu.popup();
  });

  return { button };
}

function openWithApplication({ appInfo, location, content_type }) {
  if (GLib.getenv("FLATPAK_ID")) {
    appInfo = flatpakSpawnify(appInfo);
  }

  const uri = parse(location);
  const uri_str = uri.to_string();

  let success;
  if (appInfo.supports_uris()) {
    success = appInfo.launch_uris([uri_str], null);
  } else {
    const file = Gio.File.new_for_uri(uri_str);
    success = appInfo.launch([file], null);
  }

  if (!success) {
    throw new Error(`Could not launch ${location} with ${appInfo.get_id()}`);
  }

  if (!GLib.getenv("FLATPAK_ID")) {
    // On Flatpak fails with
    // (re.sonny.Junction:3): Gjs-WARNING **: 18:35:39.427: JS ERROR: Gio.IOErrorEnum: Can’t create user desktop file /home/sonny/.var/app/re.sonny.Junction/data/applications/userapp-YOGA Image Optimizer-20X240.desktop
    appInfo.set_as_last_used_for_type(content_type);
  }
}

function flatpakSpawnify(appInfo) {
  const filename = appInfo.get_filename();
  if (!filename) {
    return appInfo;
  }

  const keyFile = new GLib.KeyFile();
  if (!keyFile.load_from_file(filename, GLib.KeyFileFlags.NONE)) {
    return null;
  }

  const Exec = keyFile.get_value("Desktop Entry", "Exec");
  if (Exec.startsWith("flatpak-spawn")) {
    return null;
  }

  if (!Exec) {
    logError(new Error(`No Exec for ${filename}`));
    return null;
  }
  keyFile.set_value("Desktop Entry", "Exec", `flatpak-spawn --host ${Exec}`);

  return Gio.DesktopAppInfo.new_from_keyfile(keyFile);
}
