import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

import { logEnum } from "./util.js";

export default function Window({ application, file }) {
  // This is a bit hack-ish but until we have a custom application chooser
  // let's be lazy and use AppChoserDialog and a "fake" ApplicationWindow
  const window = new Gtk.ApplicationWindow({ application });

  let content_type = "application/octet-stream";
  let display_name = "";
  const scheme = file.get_uri_scheme();
  if (scheme !== "file") {
    content_type = `x-scheme-handler/${scheme}`;
    display_name = file.get_uri();
  } else {
    try {
      const info = file.query_info(
        "standard::content-type,standard::display-name",
        Gio.FileQueryInfoFlags.NONE,
        null,
      );
      content_type = info.get_content_type();
      display_name = info.get_display_name();
    } catch (err) {
      display_name = file.get_basename();
      logError(err);
    }
  }

  const dialog = Gtk.AppChooserDialog.new_for_content_type(
    window,
    Gtk.DialogFlags.MODAL,
    content_type,
  );

  dialog
    .get_header_bar()
    ?.get_title_widget()
    ?.get_last_child()
    ?.set_label(display_name);

  dialog.connect("response", (self, response_type) => {
    if (__DEV__) {
      logEnum(Gtk.ResponseType, response_type);
    }

    if (response_type === Gtk.ResponseType.OK) {
      const app = dialog.get_app_info();
      log(`Opening ${file.get_uri()} with ${app.get_id()}`);
      openWithApplication(app, file);
    }

    dialog.destroy();
    application.quit();
  });

  dialog.present();

  return window;
}

function openWithApplication(app, file) {
  const success = app.launch_uris([file.get_uri()], null);
  if (!success) {
    throw new Error(`Could not launch ${file.get_uri()} with ${app.get_id()}`);
  }
}
