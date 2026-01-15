import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import { gettext as _ } from "gettext";
import Xdp from "gi://Xdp";
import XdpGtk4 from "gi://XdpGtk4";

import { build } from "../troll/src/main.js";

import { openWithApplication, getIconFilename, getKeyFile } from "./util.js";
import { settings } from "./common.js";
import Interface from "./AppButton.blp" with { type: "uri" };

const portal = new Xdp.Portal();
Gio._promisify(portal, "open_directory", "open_directory_finish");

export function TileButton({
  label,
  tooltip = label,
  icon_name,
  icon_size,
  onClicked,
}) {
  const {
    button,
    label: glabel,
    image,
  } = build(Interface, {
    onClicked,
  });

  button.set_tooltip_text(tooltip);
  glabel.label = label;
  glabel.visible = false;
  settings.bind("show-app-names", glabel, "visible", Gio.SettingsBindFlags.GET);

  image.set_from_icon_name(icon_name);
  if (icon_size) {
    image.set_pixel_size(icon_size);
  }

  return button;
}

export default function AppButton({ appInfo, content_type, entry, window }) {
  const { button, label, image, box } = build(Interface, {
    onClicked() {
      open(true);
    },
  });

  const name = appInfo.get_display_name();
  button.set_tooltip_text(name);
  label.label = name;
  label.visible = false;
  settings.bind("show-app-names", label, "visible", Gio.SettingsBindFlags.GET);

  const menu = new Gio.Menu();
  const popoverMenu = Gtk.PopoverMenu.new_from_model(menu);
  box.append(popoverMenu);

  const icon = appInfo.get_icon();
  if (icon instanceof Gio.ThemedIcon) {
    image.set_from_gicon(icon);
  } else if (icon instanceof Gio.FileIcon) {
    image.set_from_file(getIconFilename(icon.get_file().get_path()));
  }

  function open(close_on_success) {
    const success = openWithApplication({
      appInfo,
      location: entry.get_text(),
      content_type,
    });
    if (close_on_success && success) {
      window.close();
    }
  }

  const event_controller_click = new Gtk.GestureClick({ button: 0 });
  button.add_controller(event_controller_click);
  event_controller_click.connect("pressed", () => {
    // event can be a Gdk.ButtonEvent or Gdk.TouchEvent
    const event = event_controller_click.get_current_event();
    const button = event.get_button?.() ?? Gdk.BUTTON_PRIMARY;

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

  const event_controller_longpress = new Gtk.GestureLongPress();
  button.add_controller(event_controller_longpress);
  event_controller_longpress.connect("pressed", () => {
    popupActionsMenu({
      appInfo,
      popoverMenu,
      location: entry.get_text(),
    });
    event_controller_longpress.set_state(Gtk.EventSequenceState.CLAIMED);
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

export function ShowInFolderButton({ file, window }) {
  function onClicked() {
    portal
      .open_directory(
        XdpGtk4.parent_new_gtk(window),
        file.get_uri(),
        Xdp.OpenUriFlags.NONE,
        null,
      )
      .then((result) => result && window.close())
      .catch(logError);
  }

  return TileButton({
    label: _("Open Location"),
    tooltip: _("View File in File Manager"),
    icon_name: "folder-symbolic",
    icon_size: 48,
    onClicked,
  });
}

function popupActionsMenu({ popoverMenu, appInfo, location }) {
  const actions = appInfo.list_actions();
  const keyFile = getKeyFile(appInfo);
  if (!keyFile) return;

  const menu = popoverMenu.menu_model;
  menu.remove_all();

  for (const action of actions) {
    const Exec = keyFile.get_string(`Desktop Action ${action}`, "Exec");
    if (!["%U", "%u", "%f", "%F"].some((code) => Exec.includes(code))) continue;
    const action_name = appInfo.get_action_name(action);

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
