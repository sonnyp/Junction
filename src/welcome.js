import Gtk from "gi://Gtk";

import { relativePath, loadStyleSheet, spawn } from "./util.js";

export default function Welcome({ application }) {
  const builder = Gtk.Builder.new_from_file(relativePath("./welcome.ui"));
  loadStyleSheet(relativePath("./welcome.css"));

  const window = builder.get_object("welcome");
  window.set_application(application);

  setAsDefaultApplicationForWeb();

  window.present();

  return { window };
}

function setAsDefaultApplicationForWeb() {
  spawn("gio mime x-scheme-handler/https re.sonny.Junction.desktop");
  spawn("gio mime x-scheme-handler/http re.sonny.Junction.desktop");
}

// const types = [
//   "x-scheme-handler/http",
//   "x-scheme-handler/https",
//   "text/html",
//   "text/xml",
//   "application/xhtml+xml",
// ];
// for (const type of types) {
//   spawn(`gio mime ${type} re.sonny.Junction.desktop`);
// }
