import Gtk from "gi://Gtk";
import Interface from "./ShortcutsWindow.blp";

export default function ShortcutsWindow({ application }) {
  const builder = Gtk.Builder.new_from_resource(Interface);

  const window = builder.get_object("shortcuts_window");
  window.set_transient_for(application.get_active_window());
  window.set_application(application);

  window.present();
}
