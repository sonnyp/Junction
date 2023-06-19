import { build } from "../troll/src/main.js";

import Interface from "./ShortcutsWindow.blp" assert { type: "uri" };

export default function ShortcutsWindow({ application }) {
  const { window } = build(Interface);

  window.set_transient_for(application.get_active_window());
  window.set_application(application);

  window.present();
}
