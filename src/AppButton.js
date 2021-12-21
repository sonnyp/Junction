import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import { gettext as _ } from "gettext";

import { relativePath, openWithApplication } from "./util.js";
import { settings } from "./common.js";

const { byteArray } = imports;

const [, content] = GLib.file_get_contents(relativePath("./AppButton.ui"));
const template = byteArray.toString(content);

export default function AppButton({ appInfo, content_type, entry, window }) {
  const builder = Gtk.Builder.new_from_string(template, template.length);
  const button = builder.get_object("button");

  const name = appInfo.get_name();
  button.set_tooltip_text(name);
  const label = builder.get_object("label");
  label.label = name;
  label.visible = false;
  settings.bind("show-app-names", label, "visible", Gio.SettingsBindFlags.GET);

  const menu = new Gio.Menu();
  const popoverMenu = Gtk.PopoverMenu.new_from_model(menu);
  builder.get_object("box").append(popoverMenu);

  const icon = appInfo.get_icon();
  if (icon) {
    builder.get_object("image").set_from_gicon(icon);
  }

  function open(close_on_success) {
    const success = openWithApplication({
      appInfo,
      location: entry.get_text(),
      content_type,
      save: true,
    });
    if (close_on_success && success) {
      window.close();
    }
  }

  button.connect("clicked", () => {
    open(true);
  });

  const event_controller_click = new Gtk.GestureClick({ button: 0 });
  button.add_controller(event_controller_click);
  event_controller_click.connect("pressed", () => {
    const event = event_controller_click.get_current_event();
    const button = event.get_button();

    // Right click
    if (button === Gdk.BUTTON_SECONDARY) {
      popupActionsMenu({
        appInfo,
        popoverMenu,
        location: entry.get_text(),
      });
      event_controller_click.set_state(Gtk.EventSequenceState.CLAIMED);
      return;
    }

    if (button === Gdk.BUTTON_MIDDLE) {
      open(false);
      event_controller_click.set_state(Gtk.EventSequenceState.CLAIMED);
      return;
    }

    if (button === Gdk.BUTTON_PRIMARY) {
      const modifier_state = event.get_modifier_state();
      // Ctrl click
      open(!(modifier_state & Gdk.ModifierType.CONTROL_MASK));
      event_controller_click.set_state(Gtk.EventSequenceState.CLAIMED);
      return;
    }

    event_controller_click.set_state(Gtk.EventSequenceState.DENIED);
  });

  const controller_key = new Gtk.EventControllerKey();
  button.add_controller(controller_key);
  controller_key.connect(
    "key-released",
    (self, keyval, keycode, modifier_state) => {
      const keyname = Gdk.keyval_name(keyval);
      if (keyname === "Menu") {
        popupActionsMenu({
          appInfo,
          popoverMenu,
          location: entry.get_text(),
        });
      }

      if (
        (keyname === "Return" || keyname === "space") &&
        modifier_state & Gdk.ModifierType.CONTROL_MASK
      ) {
        open(false);
      }
    },
  );

  return button;
}

export function ViewAllButton({ file, content_type, entry, window }) {
  const builder = Gtk.Builder.new_from_string(template, template.length);
  const button = builder.get_object("button");

  const name = _("View All");
  button.set_tooltip_text(name);
  const label = builder.get_object("label");
  label.label = name;
  label.visible = false;
  settings.bind("show-app-names", label, "visible", Gio.SettingsBindFlags.GET);

  const image = builder.get_object("image");
  image.set_from_icon_name("view-more-horizontal-symbolic");
  image.set_pixel_size(48);

  function onResponse(appChooserDialog, response_id) {
    if (response_id !== Gtk.ResponseType.OK) {
      appChooserDialog.destroy();
      return;
    }

    const appInfo = appChooserDialog.get_app_info();

    const success = openWithApplication({
      appInfo,
      location: entry.get_text(),
      content_type,
      save: false,
    });
    if (!success) {
      return;
    }

    appChooserDialog.destroy();
    window.close();
  }

  function onClicked() {
    // TODO: Implement an app chooser in the window
    // Unfortunally AppChooserWidget doesn't have search or "Find new Applications"
    // so we are using AppChooserDialog for now
    // we should implement our own inline widget eventually
    const appChooserDialog = Gtk.AppChooserDialog.new(
      window,
      Gtk.DialogFlags.MODAL,
      file,
    );
    const title_widget = appChooserDialog.get_header_bar()?.get_title_widget();
    if (title_widget) {
      const [title, subtitle] = [...title_widget];
      title.label = _("All Applications");
      title_widget.remove(subtitle);
    }

    const appChooserWidget = appChooserDialog.get_widget();
    appChooserWidget.set_show_default(false);
    appChooserWidget.set_show_recommended(true);
    appChooserWidget.set_show_fallback(true);
    appChooserWidget.set_show_other(true);
    // FIXME: Search is kinda broken unless this
    // appChooserWidget.set_show_all(true);
    appChooserDialog.connect("response", onResponse);
    appChooserDialog.show();
  }

  button.connect("clicked", onClicked);

  return button;
}

function popupActionsMenu({ popoverMenu, appInfo, location }) {
  const filename = appInfo.get_filename();
  const keyFile = new GLib.KeyFile();
  keyFile.load_from_file(filename, GLib.KeyFileFlags.NONE);
  const desktopAppInfo = Gio.DesktopAppInfo.new_from_keyfile(keyFile);
  const actions = desktopAppInfo.list_actions();

  const menu = popoverMenu.menu_model;
  menu.remove_all();

  for (const action of actions) {
    const Exec = keyFile.get_string(`Desktop Action ${action}`, "Exec");
    if (!["%U", "%u", "%f", "%F"].some((code) => Exec.includes(code))) continue;
    const action_name = desktopAppInfo.get_action_name(action);

    const value = new GLib.Variant("a{ss}", {
      desktop_id: appInfo.get_id(),
      action,
      location,
    });

    const item = Gio.MenuItem.new(action_name, null);
    item.set_action_and_target_value("win.run_action", value);
    menu.append_item(item);
  }

  if (menu.get_n_items() > 0) popoverMenu.popup();
}
