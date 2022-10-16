#!/usr/bin/env -S XDG_DATA_DIRS=${XDG_DATA_DIRS}:/run/host/usr/share:/var/lib/snapd/desktop:/var/lib/flatpak/exports/share:${HOME}/.local/share/flatpak/exports/share gjs -m

import { exit } from "system";
import GLib from "gi://GLib";
import { setConsoleLogDomain } from "console";

imports.package.init({
  name: "@app_id@",
  version: "@version@",
  prefix: "@prefix@",
  libdir: "@libdir@",
  datadir: "@datadir@",
});
setConsoleLogDomain(pkg.name);
GLib.set_application_name("Junction");

globalThis.__DEV__ = false;

const loop = new GLib.MainLoop(null, false);
import("resource:///re/sonny/Junction/main.js")
  .then((main) => {
    // Workaround for issue
    // https://gitlab.gnome.org/GNOME/gjs/-/issues/468
    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      loop.quit();
      const exit_code = imports.package.run(main);
      exit(exit_code);
      return GLib.SOURCE_REMOVE;
    });
  })
  .catch(logError);
loop.run();
