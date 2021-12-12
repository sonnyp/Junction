import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import { gettext as _ } from "gettext";
import GLib from "gi://GLib";
import { programInvocationName } from "system";

import {
  getGIRepositoryVersion,
  getGjsVersion,
  getGLibVersion,
  getOSRelease,
  getFlatpakInfo,
} from "./util.js";

export default function About({ application, datadir, version }) {
  const os_release = getOSRelease();
  const flatpak_info = getFlatpakInfo();

  const flatpak = flatpak_info
    ? `flatpak ${flatpak_info?.get_string("Instance", "flatpak-version")}\n`
    : "";

  const debug = `
Junction:
version ${version}
programInvocationName ${programInvocationName}
argv ${ARGV.join(" ")}
cwd ${GLib.get_current_dir()}
datadir ${datadir}

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
$XDG_SESSION_TYPE ${GLib.getenv("XDG_SESSION_TYPE")}
  `.trim();

  const dialog = new Gtk.AboutDialog({
    application,
    authors: ["Sonny Piers https://sonny.re"],
    artists: ["Tobias Bernard <tbernard@gnome.org>"],
    comments: _("Application chooser"),
    copyright: "Copyright 2021 Sonny Piers",
    license_type: Gtk.License.GPL_3_0_ONLY,
    version,
    website: "https://junction.sonny.re",
    transient_for: application.get_active_window(),
    // Prevents input on Junction when clicking on a link
    // modal: true,
    logo_icon_name: "re.sonny.Junction",
    // TRANSLATORS: eg. 'Translator Name <your.email@domain.com>' or 'Translator Name https://website.example'
    translator_credits: _("translator-credits"),
    system_information: debug,
  });
  // dialog.add_credit_section("Contributors", [
  //   // Add yourself as
  //   // "John Doe",
  //   // or
  //   // "John Doe <john@example.com>",
  //   // or
  //   // "John Doe https://john.com",
  // ]);
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
