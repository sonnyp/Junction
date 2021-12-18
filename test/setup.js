import "gi://Gtk?version=4.0";
import GLib from "gi://GLib";
import { stdout, stderr } from "../src/util.js";

globalThis.setTimeout = function setTimeout(func, delay, ...args) {
  if (typeof delay !== "number" || delay < 0) delay = 0;

  return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
    func(...args);
    return false;
  });
};

globalThis.clearTimeout = function clearTimeout(id) {
  if (!id) return;
  return GLib.source_remove(id);
};

globalThis.setInterval = function setInterval(func, delay, ...args) {
  if (typeof delay !== "number" || delay < 0) delay = 0;

  return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
    func(...args);
    return true;
  });
};

globalThis.clearInterval = function clearInterval(id) {
  return GLib.source_remove(id);
};

const decoder = new TextDecoder();
GLib.log_set_writer_func((log_level, fields) => {
  const output = log_level === GLib.LogLevelFlags.LEVEL_ERROR ? stderr : stdout;
  output.put_string(decoder.decode(fields.MESSAGE), null);
  return GLib.LogWriterOutput.HANDLED;
});
