import Gtk from "gi://Gtk";
import GLib from "gi://GLib";

export default function Entry({ entry, value, scheme }) {
  entry.set_text(value);

  if (scheme === "file") {
    entry.set_editable(false);
    // for files we want to see the filename
    entry.set_position(-1);
  } else {
    // for urls we want to see the hostname
    entry.set_position(0);
  }

  if (scheme === "http") {
    entry.set_icon_from_icon_name(
      Gtk.EntryIconPosition.PRIMARY,
      "channel-insecure-symbolic",
    );
  }

  const eventController = new Gtk.EventControllerFocus();
  entry.add_controller(eventController);
  eventController.connect("enter", () => {
    // Unselect and "scroll" to end
    // User will almost always want to endit the end of the URL
    // it's too late to call entry.grab_focus_without_selecting();
    // For some reason Promise.resolve().then(foo) is not called
    // A bit hackish
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, () => {
      entry.select_region(-1, 0);
      entry.set_position(-1);
      return GLib.SOURCE_REMOVE;
    });
  });

  return { entry };
}
