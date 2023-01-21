#!/usr/bin/env -S gjs -m

// -*- mode: js; -*-

import { exit } from "system";
import GLib from "gi://GLib";
import { setConsoleLogDomain } from "console";
import Gio from "gi://Gio";

import { build as gjspack } from "../troll/gjspack/src/gjspack.js";

imports.package.init({
  name: "re.sonny.Junction",
  version: "dev",
  prefix: "/tmp/Junction",
  libdir: "/tmp/Junction",
  datadir: "/tmp/Junction",
});
setConsoleLogDomain(pkg.name);
GLib.set_application_name("Junction");

globalThis.__DEV__ = true;

const { gresource_path, prefix } = gjspack({
  appid: "re.sonny.Junction",
  prefix: "/re/sonny/Junction",
  project_root: Gio.File.new_for_path("."),
  resource_root: Gio.File.new_for_path("./src"),
  entry: Gio.File.new_for_path("./src/main.js"),
  output: Gio.File.new_for_path("./src"),
  potfiles: Gio.File.new_for_path("./po/POTFILES"),
});
const resource = Gio.resource_load(gresource_path);
Gio.resources_register(resource);

const loop = new GLib.MainLoop(null, false);
import(`resource://${prefix}/main.js`)
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
