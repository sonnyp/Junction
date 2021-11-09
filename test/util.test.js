import GLib from "gi://GLib";
import "gi://Gtk?version=4.0";

import { parse } from "../src/util.js";

export class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = "AssertionError";
  }
}

export function assert(value, message = "") {
  if (!value) throw new AssertionError(message);
}

export function is(actual, expected, message) {
  if (!Object.is(actual, expected)) {
    throw new AssertionError(
      message || `Expected "${actual}" to be "${expected}".`,
    );
  }
}

const home_dir = GLib.get_home_dir();

is(parse("~").to_string(), `file://${home_dir}`);
is(parse("~/").to_string(), `file://${home_dir}`);
is(parse("~/foo").to_string(), `file://${home_dir}/foo`);
is(parse("/").to_string(), `file:///`);
is(parse("/foo/").to_string(), `file:///foo/`);
is(parse("/foo").to_string(), `file:///foo`);
is(parse("/foo/bar").to_string(), `file:///foo/bar`);
is(parse("mailto:foo@bar.com").to_string(), "mailto:foo@bar.com");
is(parse("http://example.com").to_string(), "http://example.com");
