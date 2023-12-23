import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import GLib from "gi://GLib";

import { build } from "../troll/src/main.js";

import { readResource, openWithAction } from "./util.js";
import Entry from "./Entry.js";
import AppButton, { ViewAllButton, ShowInFolderButton } from "./AppButton.js";
import { settings } from "./common.js";
import Interface from "./window.blp" assert { type: "uri" };

export default function Window({ application, file }) {
  const { window, list, entry } = build(Interface);

  if (__DEV__) window.add_css_class("devel");
  window.set_application(application);

  const { content_type, resource, scheme } = readResource(file);

  Entry({
    entry,
    resource,
    scheme,
  });

  const applications = getApplications(content_type);

  const options = [];

  applications.forEach((appInfo) => {
    const button = AppButton({
      appInfo,
      content_type,
      entry,
      window,
    });
    appInfo.button = button;
    options.push(button);
    list.append(
      new Gtk.FlowBoxChild({
        focusable: false,
        child: button,
      }),
    );
  });

  if (
    scheme === "file" &&
    !["inode/directory", "application/octet-stream"].includes(content_type)
  ) {
    const button = ShowInFolderButton({
      file,
      entry,
      window,
    });
    options.push(button);
    list.append(
      new Gtk.FlowBoxChild({
        focusable: false,
        child: button,
      }),
    );
  }

  (() => {
    const button = ViewAllButton({
      content_type,
      entry,
      window,
    });
    options.push(button);
    list.append(
      new Gtk.FlowBoxChild({
        focusable: false,
        child: button,
      }),
    );
  })();

  function getButtonForKeyval(keyval) {
    const keyname = Gdk.keyval_name(keyval);
    // Is not 0...9
    if (!/^\d$/.test(keyname)) return null;
    const n = +keyname;
    return options[n - 1];
  }

  const eventController = new Gtk.EventControllerKey();
  eventController.connect("key-pressed", (self, keyval) => {
    const button = getButtonForKeyval(keyval);
    button?.grab_focus();
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
  const applications = Gio.AppInfo.get_recommended_for_type(content_type);
  return applications.filter((appInfo) => {
    return !excluded_apps.includes(appInfo.get_id());
  });
}
