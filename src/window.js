import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import GLib from "gi://GLib";

import { readResource, openWithAction } from "./util.js";
import Entry from "./Entry.js";
import AppButton, { ViewAllButton, RevealInFolderButton } from "./AppButton.js";
import { settings } from "./common.js";
import Interface from "./window.blp";

export default function Window({ application, file }) {
  const builder = Gtk.Builder.new_from_resource(Interface);

  const window = builder.get_object("window");
  if (__DEV__) window.add_css_class("devel");
  window.set_application(application);

  const { content_type, resource, scheme } = readResource(file);

  const { entry } = Entry({
    entry: builder.get_object("entry"),
    resource,
    scheme,
  });

  const applications = getApplications(content_type);
  const list = builder.get_object("list");

  applications.forEach((appInfo) => {
    const button = AppButton({
      appInfo,
      content_type,
      entry,
      window,
    });
    appInfo.button = button;
    list.append(
      new Gtk.FlowBoxChild({
        focusable: false,
        child: button,
      }),
    );
  });

  list.append(
    new Gtk.FlowBoxChild({
      focusable: false,
      child: ViewAllButton({
        content_type,
        entry,
        window,
      }),
    }),
  );

  if (
    scheme === "file" &&
    !["inode/directory", "application/octet-stream"].includes(content_type)
  ) {
    list.append(
      new Gtk.FlowBoxChild({
        focusable: false,
        child: RevealInFolderButton({
          file,
          entry,
          window,
        }),
      }),
    );
  }

  const buttons = [...list];

  function getButtonForKeyval(keyval) {
    const keyname = Gdk.keyval_name(keyval);
    // Is not 0...9
    if (!/^\d$/.test(keyname)) return null;
    const n = +keyname;
    return buttons[n - 1];
  }

  const eventController = new Gtk.EventControllerKey();
  eventController.connect("key-pressed", (self, keyval) => {
    const button = getButtonForKeyval(keyval);
    button?.grab_focus();
    return !!button;
  });
  eventController.connect("key-released", (self, keyval) => {
    const button = getButtonForKeyval(keyval);
    button?.activate();
    return !!button;
  });
  window.add_controller(eventController);

  function copyToClipboard() {
    const display = Gdk.Display.get_default();
    const clipboard = display.get_clipboard();
    clipboard.set(entry.get_text());
  }
  const copy = new Gio.SimpleAction({
    name: "copy",
    parameter_type: null,
  });
  copy.connect("activate", copyToClipboard);
  window.add_action(copy);

  // const list = builder.get_object("list");

  function adjust() {
    if (window.default_width > window.default_height) {
      list.halign = Gtk.Align.CENTER;
      list.valign = Gtk.Align.CENTER;
    } else {
      list.halign = Gtk.Align.FILL;
      list.valign = Gtk.Align.END;
    }
  }

  window.connect("notify::default-width", () => {
    adjust();
  });
  window.connect("notify::default-height", () => {
    adjust();
  });

  const toggleAppNames = settings.create_action("show-app-names");
  window.add_action(toggleAppNames);

  const run_action = new Gio.SimpleAction({
    name: "run_action",
    parameter_type: new GLib.VariantType("a{ss}"),
  });
  run_action.connect("activate", (self, variant) => {
    const data = variant.deep_unpack();

    const success = openWithAction(data);
    if (success) window.close();
  });
  window.add_action(run_action);

  window.present();

  return { window };
}

const excluded_apps = [
  // Exclude self for obvious reason
  "re.sonny.Junction.desktop",
  // Braus is similar to Junction
  "com.properlypurple.braus.desktop",
  // SpaceFM handles urls for some reason
  // https://github.com/properlypurple/braus/issues/26
  // https://github.com/IgnorantGuru/spacefm/blob/e6f291858067e73db44fb57c90e4efb97b088ac8/data/spacefm.desktop.in
  "spacefm.desktop",
];

function getApplications(content_type) {
  // console.time("foo");
  // Gio.AppInfo.get_recommended_for_type(content_type);
  // console.timeEnd("foo");

  // console.time("bar");
  // Gio.AppInfo.get_all();
  // console.timeEnd("bar");

  const applications = Gio.AppInfo.get_recommended_for_type(content_type);
  // const applications = Gio.AppInfo.get_all();

  return applications.filter((appInfo) => {
    return !excluded_apps.includes(appInfo.get_id());
  });
}
