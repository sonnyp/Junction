import builder from "./ShortcutsWindow.ui" assert { type: "builder" };

export default function ShortcutsWindow({ application }) {
  const window = builder.get_object("shortcuts_window");
  window.set_transient_for(application.get_active_window());
  window.set_application(application);

  window.present();
}
