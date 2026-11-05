import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import { gettext as _ } from "gettext";

import { getApplications } from "./window.js";
import { resolveApp } from "./profiles.js";
import {
  MATCH_TYPES,
  getRules,
  saveRules,
  isValidPattern,
  getHost,
} from "./rules.js";

export default function Preferences({ application }) {
  const applications = getApplications("x-scheme-handler/https");
  const app_names = Gtk.StringList.new(
    applications.map((appInfo) => appInfo.get_display_name()),
  );
  const type_names = Gtk.StringList.new(MATCH_TYPES.map(({ label }) => label));

  const rules = getRules();

  // Follow profiles that were added or removed since the rule was saved
  let migrated = false;
  for (const rule of rules) {
    const appInfo = resolveApp(rule[2], applications);
    if (!appInfo || appInfo.get_id() === rule[2]) continue;
    rule[2] = appInfo.get_id();
    migrated = true;
  }
  if (migrated) saveRules(rules);

  const add = new Gtk.Button({
    label: _("Add Rule"),
    halign: Gtk.Align.CENTER,
    css_classes: ["pill"],
  });
  const add_group = new Adw.PreferencesGroup();
  add_group.add(add);

  const group = new Adw.PreferencesGroup({
    title: _("Rules"),
    description: _(
      "Matching links open directly in the chosen app, without asking. The first matching rule wins.",
    ),
  });

  let rows = [];

  function rebuild() {
    rows.forEach((row) => group.remove(row));
    rows = rules.map(createRow);
    rows.forEach((row) => group.add(row));
  }

  function createRow(rule) {
    const row = new Adw.EntryRow({
      title: _("Pattern"),
      text: rule[1],
    });

    function validate() {
      if (isValidPattern(rule[0], rule[1])) {
        row.remove_css_class("error");
        return;
      }
      row.add_css_class("error");
    }
    validate();

    row.connect("changed", () => {
      rule[1] = row.text;
      saveRules(rules);
      validate();
    });

    const type_dropdown = new Gtk.DropDown({
      model: type_names,
      selected: Math.max(
        MATCH_TYPES.findIndex(({ id }) => id === rule[0]),
        0,
      ),
      valign: Gtk.Align.CENTER,
    });
    type_dropdown.connect("notify::selected", () => {
      rule[0] = MATCH_TYPES[type_dropdown.selected].id;
      saveRules(rules);
      validate();
    });
    row.add_suffix(type_dropdown);

    const index = applications.findIndex((app) => app.get_id() === rule[2]);
    const app_dropdown = new Gtk.DropDown({
      model: app_names,
      selected: index >= 0 ? index : Gtk.INVALID_LIST_POSITION,
      valign: Gtk.Align.CENTER,
    });
    app_dropdown.connect("notify::selected", () => {
      const appInfo = applications[app_dropdown.selected];
      if (!appInfo) return;
      rule[2] = appInfo.get_id();
      saveRules(rules);
    });
    row.add_suffix(app_dropdown);

    const remove = new Gtk.Button({
      icon_name: "user-trash-symbolic",
      tooltip_text: _("Remove Rule"),
      valign: Gtk.Align.CENTER,
      css_classes: ["flat"],
    });
    remove.connect("clicked", () => {
      rules.splice(rules.indexOf(rule), 1);
      saveRules(rules);
      rebuild();
    });
    row.add_suffix(remove);

    return row;
  }

  add.connect("clicked", () => {
    if (applications.length === 0) return;
    rules.push(["domain", "", applications[0].get_id()]);
    saveRules(rules);
    rebuild();
  });

  function addRule(url) {
    if (applications.length === 0) return;
    rules.push(["domain", getHost(url), applications[0].get_id()]);
    saveRules(rules);
    rebuild();
  }

  const page = new Adw.PreferencesPage();
  page.add(add_group);
  page.add(group);

  const window = new Adw.PreferencesWindow({
    application,
    title: _("URL Rules"),
    default_width: 640,
    default_height: 480,
  });
  window.add(page);

  rebuild();
  window.present();

  return { window, addRule };
}
