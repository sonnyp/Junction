import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";

import { openWithApplication } from "./util.js";

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
        uri: entry.get_text(),
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
