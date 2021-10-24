import Gio from "gi://Gio";
import { openWithApplication } from "./util.js";
import GLib from "gi://GLib";

const byteArray = imports.byteArray;

const userscript_filename = GLib.build_filenamev([
  GLib.get_user_config_dir(),
  "Junction/userscript.js",
]);

export function passThroughUserScript({ content_type, URI, file }) {
  const fn = readUserscript();
  if (!fn) return false;

  try {
    const result = fn({ content_type, URI, file });
    if (!result.app) return false;

    const appInfo = Gio.DesktopAppInfo.new(result.app);
    if (!appInfo) throw new Error(`Could not find application ${result}`);
    openWithApplication({
      appInfo,
      uri: result.uri || file.get_uri(),
    });
    return true;
  } catch (err) {
    logError(err);
  }

  return false;
}

function readUserscript() {
  try {
    const [, contents] = GLib.file_get_contents(userscript_filename);
    const str = byteArray.toString(contents).trim();
    if (str) return new Function("resource", `'use strict';\n${str}`);
  } catch (err) {
    if (err.code !== GLib.FileError.NOENT) {
      logError(err);
    }
  }
}
