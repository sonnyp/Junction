import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";

export default function AppButton({ appInfo, content_type, entry, window }) {
  const button = new Gtk.Button();

  const icon = appInfo.get_icon();
  if (icon) {
    const image = Gtk.Image.new_from_gicon(appInfo.get_icon());
    image.pixel_size = 92;
    button.set_child(image);
  } else {
    button.label = appInfo.get_name();
  }

  button.set_tooltip_text(appInfo.get_name());

  function open() {
    try {
      openWithApplication({
        appInfo,
        resource: entry.get_text(),
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
  button.add_controller(eventController);
  eventController.connect("end", () => {
    open();
  });

  return { button };
}

function openWithApplication({ appInfo, resource, content_type }) {
  if (GLib.getenv("FLATPAK_ID")) {
    appInfo = flatpakSpawnify(appInfo);
  }

  let success;

  if (appInfo.supports_uris()) {
    success = appInfo.launch_uris([resource], null);
  } else {
    const file = Gio.File.new_for_path(resource);
    success = appInfo.launch([file], null);
  }

  if (!success) {
    throw new Error(`Could not launch ${resource} with ${appInfo.get_id()}`);
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
