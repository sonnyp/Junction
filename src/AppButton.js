import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import { gettext as _ } from "gettext";

import { parse, relativePath } from "./util.js";
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
  settings.bind("show-app-names", label, "visible", Gio.SettingsBindFlags.GET);
  settings.bind(
    "show-app-names",
    button,
    "has-tooltip",
    Gio.SettingsBindFlags.GET | Gio.SettingsBindFlags.INVERT_BOOLEAN,
  );

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
        save: true,
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
  button.add_controller(eventController);
  eventController.connect("end", () => {
    open();
  });

  return button;
}

function openWithApplication({ appInfo, location, content_type, save }) {
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

  if (save && !GLib.getenv("FLATPAK_ID")) {
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
    console.error(`No Exec for ${filename}`);
    return null;
  }
  keyFile.set_value("Desktop Entry", "Exec", `flatpak-spawn --host ${Exec}`);

  return Gio.DesktopAppInfo.new_from_keyfile(keyFile);
}

export function ViewAllButton({ file, content_type, entry, window }) {
  const builder = Gtk.Builder.new_from_string(template, template.length);
  const button = builder.get_object("button");

  const name = _("View All");
  button.set_tooltip_text(name);
  const label = builder.get_object("label");
  label.label = name;
  label.visible = false;
  settings.bind("show-app-names", label, "visible", Gio.SettingsBindFlags.GET);
  settings.bind(
    "show-app-names",
    button,
    "has-tooltip",
    Gio.SettingsBindFlags.GET | Gio.SettingsBindFlags.INVERT_BOOLEAN,
  );

  const image = builder.get_object("image");
  image.set_from_icon_name("view-more-horizontal-symbolic");
  image.set_pixel_size(48);

  function onResponse(appChooserDialog, response_id) {
    if (response_id !== Gtk.ResponseType.OK) {
      appChooserDialog.destroy();
      return;
    }

    const appInfo = appChooserDialog.get_app_info();
    try {
      openWithApplication({
        appInfo,
        location: entry.get_text(),
        content_type,
        save: false,
      });
    } catch (err) {
      logError(err);
      return;
    }

    appChooserDialog.destroy();
    window.close();
  }

  function onClicked() {
    // TODO: Implement an app chooser in the window
    // Unfortunally AppChooserWidget doesn't have search or "Find new Applications"
    // so we are using AppChooserDialog for now
    // we should implement our own inline widget eventually
    const appChooserDialog = Gtk.AppChooserDialog.new(
      window,
      Gtk.DialogFlags.MODAL,
      file,
    );
    const title_widget = appChooserDialog.get_header_bar()?.get_title_widget();
    if (title_widget) {
      const [title, subtitle] = [...title_widget];
      title.label = _("All Applications");
      title_widget.remove(subtitle);
    }

    const appChooserWidget = appChooserDialog.get_widget();
    appChooserWidget.set_show_default(false);
    appChooserWidget.set_show_recommended(true);
    appChooserWidget.set_show_fallback(true);
    appChooserWidget.set_show_other(true);
    // FIXME: Search is kinda broken unless this
    // appChooserWidget.set_show_all(true);
    appChooserDialog.connect("response", onResponse);
    appChooserDialog.show();
  }

  button.connect("clicked", onClicked);

  return button;
}
