import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import { gettext as _ } from "gettext";
import GLib from "gi://GLib";
import { programInvocationName } from "system";

import { getOSRelease, getFlatpakInfo } from "./util.js";

import {
  getGIRepositoryVersion,
  getGjsVersion,
  getGLibVersion,
} from "../troll/src/util.js";

export default function About({ application }) {
  const os_release = getOSRelease();
  const flatpak_info = getFlatpakInfo();

  const flatpak = flatpak_info
    ? `flatpak ${flatpak_info?.get_string("Instance", "flatpak-version")}\n`
    : "";

  const debug_info = `
Junction:
version ${pkg.version}
programInvocationName ${programInvocationName}
argv ${ARGV.join(" ")}
cwd ${GLib.get_current_dir()}
datadir ${pkg.datadir}

Powered by:
GJS ${getGjsVersion()}
libadwaita ${getGIRepositoryVersion(Adw)}
GTK ${getGIRepositoryVersion(Gtk)}
GLib ${getGLibVersion()}
${flatpak}
Environment:
OS ${os_release["NAME"]} ${os_release["VERSION"] || ""}
$XDG_DATA_DIRS ${GLib.getenv("XDG_DATA_DIRS")}
$PATH ${GLib.getenv("PATH")}
$FLATPAK_ID ${GLib.getenv("FLATPAK_ID")}
$XDG_CURRENT_DESKTOP ${GLib.getenv("XDG_CURRENT_DESKTOP")}
$XDG_SESSION_TYPE ${GLib.getenv("XDG_SESSION_TYPE")}
  `.trim();

  const dialog = new Adw.AboutWindow({
    transient_for: application.get_active_window(),
    application_name: "Junction",
    developer_name: "Sonny Piers",
    copyright: "© 2021-2022 Sonny Piers",
    license_type: Gtk.License.GPL_3_0_ONLY,
    version: pkg.version,
    website: "https://junction.sonny.re",
    application_icon: "re.sonny.Junction",
    issue_url: "https://github.com/sonnyp/Junction/issues",
    // TRANSLATORS: eg. 'Translator Name <your.email@domain.com>' or 'Translator Name https://website.example'
    translator_credits: _("translator-credits"),
    debug_info,
    developers: ["Sonny Piers https://sonny.re"],
    designers: [
      "Sonny Piers https://sonny.re",
      "Tobias Bernard <tbernard@gnome.org>",
    ],
    artists: ["Tobias Bernard <tbernard@gnome.org>"],
    // If the window is modal - it's not possibly to open
    // urls from it as it will open a new Junction window
    // that doesn't register click events
    modal: false,
  });
  dialog.add_credit_section("Contributors", [
    "Patrick Decat https://github.com/pdecat",
  ]);
  dialog.present();

  return { dialog };
}

// $_: ${GLib.getenv("_")}
// $XDG_CONFIG_DIRS ${GLib.getenv("XDG_CONFIG_DIRS")}
// $XDG_CONFIG_HOME ${GLib.getenv("XDG_CONFIG_HOME")}
// GLib.get_home_dir();
// GLib.get_system_config_dirs();
// GLIB.get_system_data_dirs();
// GLIB.get_user_data_dir();
// GLib.get_user_config_dir();
