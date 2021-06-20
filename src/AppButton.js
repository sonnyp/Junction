import Gtk from "gi://Gtk";

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

  button.connect("clicked", () => {
    try {
      openWithApplication({
        appInfo,
        resource: entry.get_text(),
        content_type,
      });
    } catch (err) {
      return logError(err);
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
    window.close();
  });

  return { button };
}

function openWithApplication({ appInfo, resource, content_type }) {
  const success = appInfo.launch_uris([resource], null);
  if (!success) {
    throw new Error(`Could not launch ${resource} with ${appInfo.get_id()}`);
  }
  appInfo.set_as_last_used_for_type(content_type);
}
