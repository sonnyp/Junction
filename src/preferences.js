import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import Gio from "gi://Gio";

import { build } from "../troll/src/main.js";
import { getUrlMatchers, addUrlMatcher, removeUrlMatcher } from "./util.js";

import Interface from "./preferences.blp" assert { type: "uri" };

export default function Preferences({ application }) {
  const {
    matchers_list,
    empty_label,
    add_button,
    add_matcher_dialog,
    pattern_entry,
    preferences_window,
    app_dropdown,
    app_list_model
  } = build(Interface);

  // Add dialog responses
  add_matcher_dialog.add_response("cancel", "Cancel");
  add_matcher_dialog.add_response("add", "Add");
  add_matcher_dialog.set_response_appearance("add", Adw.ResponseAppearance.SUGGESTED);

  // Populate browser applications
  populateAppDropdown();

  // Load existing matchers
  loadMatchers();

  // Add button handler
  add_button.connect("clicked", () => {
    pattern_entry.set_text("");
    app_dropdown.set_selected(0);
    add_matcher_dialog.present(preferences_window);
  });

  // Dialog response handler
  add_matcher_dialog.connect("response", (dialog, response) => {
    if (response === "add") {
      const pattern = pattern_entry.get_text();
      const selectedIndex = app_dropdown.get_selected();

      if (pattern && selectedIndex !== Gtk.INVALID_LIST_POSITION) {
        const appString = app_list_model.get_string(selectedIndex);
        const [appId] = appString.split(" - ");

        try {
          // Test the regex pattern
          new RegExp(pattern);
          addUrlMatcher(pattern, appId);
          loadMatchers();
          dialog.close();
        } catch (err) {
          showErrorDialog("Invalid regular expression pattern. Please check your syntax.");
        }
      } else {
        showErrorDialog("Please fill in both the pattern and select an application.");
      }
    } else {
      dialog.close();
    }
  });

  function populateAppDropdown() {
    // Get all applications that can handle HTTP/HTTPS
    const apps = Gio.AppInfo.get_recommended_for_type("x-scheme-handler/http");
    const httpsApps = Gio.AppInfo.get_recommended_for_type("x-scheme-handler/https");

    // Combine and deduplicate
    const allApps = [...apps, ...httpsApps];
    const uniqueApps = new Map();

    allApps.forEach(app => {
      const id = app.get_id();
      if (!uniqueApps.has(id)) {
        uniqueApps.set(id, app);
      }
    });

    // Sort by display name
    const sortedApps = Array.from(uniqueApps.values()).sort((a, b) => {
      return a.get_display_name().localeCompare(b.get_display_name());
    });

    // Populate dropdown
    app_list_model.splice(0, app_list_model.get_n_items(), []);
    sortedApps.forEach(app => {
      const displayText = `${app.get_id()} - ${app.get_display_name()}`;
      app_list_model.append(displayText);
    });
  }

  function loadMatchers() {
    // Clear existing items
    let child = matchers_list.get_first_child();
    while (child) {
      const next = child.get_next_sibling();
      matchers_list.remove(child);
      child = next;
    }

    const matchers = getUrlMatchers();

    if (matchers.length === 0) {
      matchers_list.append(empty_label);
    } else {
      matchers.forEach((matcher, index) => {
        const row = createMatcherRow(matcher, index);
        matchers_list.append(row);
      });
    }
  }

  function createMatcherRow(matcher, index) {
    const appInfo = Gio.DesktopAppInfo.new(matcher.appId);
    const appName = appInfo ? appInfo.get_display_name() : matcher.appId;

    const row = new Adw.ActionRow({
      title: matcher.pattern,
      subtitle: `Opens with: ${appName}`,
    });

    const deleteButton = new Gtk.Button({
      icon_name: "user-trash-symbolic",
      tooltip_text: "Remove URL matcher",
      valign: Gtk.Align.CENTER,
      css_classes: ["flat"]
    });

    deleteButton.connect("clicked", () => {
      removeUrlMatcher(index);
      loadMatchers();
    });

    row.add_suffix(deleteButton);

    return row;
  }

  function showErrorDialog(message) {
    const errorDialog = new Adw.AlertDialog({
      heading: "Error",
      body: message,
    });

    errorDialog.add_response("ok", "OK");
    errorDialog.present(preferences_window);
  }

  preferences_window.present(null);
  return {preferences_window};
}
