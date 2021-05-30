import Gtk from "gi://Gtk";

export default function About({ application, version }) {
  // https://gjs-docs.gnome.org/gtk30~3.24.8/gtk.aboutdialog
  const dialog = new Gtk.AboutDialog({
    authors: ["Sonny Piers https://sonny.re"],
    comments: "Application chooser",
    copyright: "Copyright 2021 Sonny Piers",
    license_type: Gtk.License.GPL_3_0,
    version,
    website: "https://github.com/sonnyp/Junction",
    transient_for: application.get_active_window(),
    // modal: true,
    logo_icon_name: "re.sonny.Junction",
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
