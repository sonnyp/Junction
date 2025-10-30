#!/usr/bin/env -S XDG_DATA_DIRS=${XDG_DATA_DIRS}:/run/host/usr/share:/var/lib/snapd/desktop:/var/lib/flatpak/exports/share:${HOME}/.local/share/flatpak/exports/share gjs -m

import { exit, programArgs, programInvocationName } from "system";
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

const { main } = await import("resource:///re/sonny/Junction/main.js");
const exit_code = await main([programInvocationName, ...programArgs]);
exit(exit_code);
