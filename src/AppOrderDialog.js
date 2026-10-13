import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import { gettext as _ } from "gettext";

import { build } from "../troll/src/main.js";

import { settings } from "./common.js";
import { setAppIcon } from "./util.js";
import Interface from "./AppOrderDialog.blp" with { type: "uri" };

export default function AppOrderDialog({ applications, onChange }) {
  const { dialog, group } = build(Interface);

  const apps = [...applications];
  let rows = [];

  // Keep the keyboard focus on the moved application
  function focus({ button_up, button_down }, button) {
    if (!button.sensitive)
      button = button === button_up ? button_down : button_up;
    button.grab_focus();
  }

  function move(from, to) {
    apps.splice(to, 0, ...apps.splice(from, 1));

    // Applications not offered here keep their place after the ones that are
    const ids = apps.map((app) => app.get_id());
    const others = settings
      .get_strv("app-order")
      .filter((id) => !ids.includes(id));
    settings.set_strv("app-order", [...ids, ...others]);

    render();
    onChange();
  }

  function render() {
    for (const { row } of rows) group.remove(row);
    rows = apps.map((appInfo, index) => {
      const name = appInfo.get_display_name();
      const row = new Adw.ActionRow({ title: name });

      const image = new Gtk.Image({ pixel_size: 32 });
      setAppIcon(image, appInfo);
      row.add_prefix(image);

      const button_up = new Gtk.Button({
        icon_name: "go-up-symbolic",
        tooltip_text: _("Move Up"),
        valign: Gtk.Align.CENTER,
        sensitive: index > 0,
        css_classes: ["flat"],
      });
      button_up.update_property(
        [Gtk.AccessibleProperty.LABEL],
        [_("Move %s Up").replace("%s", name)],
      );
      button_up.connect("clicked", () => {
        move(index, index - 1);
        focus(rows[index - 1], rows[index - 1].button_up);
      });
      row.add_suffix(button_up);

      const button_down = new Gtk.Button({
        icon_name: "go-down-symbolic",
        tooltip_text: _("Move Down"),
        valign: Gtk.Align.CENTER,
        sensitive: index < apps.length - 1,
        css_classes: ["flat"],
      });
      button_down.update_property(
        [Gtk.AccessibleProperty.LABEL],
        [_("Move %s Down").replace("%s", name)],
      );
      button_down.connect("clicked", () => {
        move(index, index + 1);
        focus(rows[index + 1], rows[index + 1].button_down);
      });
      row.add_suffix(button_down);

      group.add(row);
      return { row, button_up, button_down };
    });
  }

  render();
  // In its own window since the Junction window is often too small for the list
  dialog.present(null);
}
