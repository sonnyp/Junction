import Gtk from "gi://Gtk";
import GLib from "gi://GLib";

export default function Entry({ builder, value, scheme }) {
  const entry = builder.get_object("entry");

  entry.set_text(value);
  // "Scroll" to end - the path for url or basename for files is more important
  entry.set_position(-1);

  if (scheme === "http") {
    entry.set_icon_from_icon_name(
      Gtk.EntryIconPosition.PRIMARY,
      "channel-insecure-symbolic",
    );
    // TODO: file a bug
    // does not seem to be working
    entry.set_icon_activatable(Gtk.EntryIconPosition.PRIMARY, false);
  }

  if (scheme === "file") {
    entry.set_editable(false);
  }

  const eventController = new Gtk.EventControllerFocus();
  entry.add_controller(eventController);
  eventController.connect("enter", () => {
    // I guess a custom widget would be required for this
    // urlEntry.grab_focus_without_selecting();
    // For some reason Promise.resolve().then(foo) is not called
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, () => {
      entry.select_region(-1, 0);
      entry.set_position(-1);
      return GLib.SOURCE_REMOVE;
    });
  });

  return { entry };
}
