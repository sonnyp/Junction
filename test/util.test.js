import "gi://Gtk?version=4.0";
import GLib from "gi://GLib";
import Gio from "gi://Gio";

import tst, { assert } from "../src/troll/tst/tst.js";

import { parse, prefixCommandLineForHost, readResource } from "../src/util.js";

const test = tst("utils");

const home_dir = GLib.get_home_dir();

test("parse", () => {
  assert.is(parse("~").to_string(), `file://${home_dir}`);
  assert.is(parse("~/").to_string(), `file://${home_dir}`);
  assert.is(parse("~/foo").to_string(), `file://${home_dir}/foo`);
  assert.is(parse("/").to_string(), `file:///`);
  assert.is(parse("/foo/").to_string(), `file:///foo/`);
  assert.is(parse("/foo").to_string(), `file:///foo`);
  assert.is(parse("/foo/bar").to_string(), `file:///foo/bar`);
  assert.is(parse("mailto:foo@bar.com").to_string(), "mailto:foo@bar.com");
  assert.is(parse("http://example.com").to_string(), "http://example.com");
});

test("readResource", () => {
  function read(str) {
    return readResource(Gio.File.new_for_commandline_arg(str));
  }

  assert.equal(read("/"), {
    resource: "/",
    scheme: "file",
    content_type: "inode/directory",
  });
  assert.equal(read("x-junction:///"), {
    resource: "/",
    scheme: "file",
    content_type: "inode/directory",
  });

  assert.equal(read("file:///etc/os-release"), {
    resource: "/etc/os-release",
    scheme: "file",
    content_type: "text/plain",
  });
  assert.equal(read("x-junction:///etc/os-release"), {
    resource: "/etc/os-release",
    scheme: "file",
    content_type: "text/plain",
  });
  assert.equal(read("x-junction://file:///etc/os-release"), {
    resource: "/etc/os-release",
    scheme: "file",
    content_type: "text/plain",
  });

  assert.equal(read("x-junction://~"), {
    resource: GLib.get_home_dir(),
    scheme: "file",
    content_type: "inode/directory",
  });
  assert.equal(read("x-junction://~/.config"), {
    resource: `${GLib.get_home_dir()}/.config`,
    scheme: "file",
    content_type: "inode/directory",
  });

  assert.equal(read("https://example.com/"), {
    resource: "https://example.com/",
    scheme: "https",
    content_type: "x-scheme-handler/https",
  });

  assert.equal(read("http://example.com/foobar?hello=world"), {
    resource: "http://example.com/foobar?hello=world",
    scheme: "http",
    content_type: "x-scheme-handler/http",
  });
  assert.equal(read("x-junction://http://example.com/foobar?hello=world"), {
    resource: "http://example.com/foobar?hello=world",
    scheme: "http",
    content_type: "x-scheme-handler/http",
  });

  const not_found_path = `/tmp/I-DO-NOT-EXIST-${Math.random()}`;
  assert.equal(read(not_found_path), {
    resource: not_found_path,
    scheme: "file",
    content_type: "application/octet-stream",
  });
});

test("prefixCommandLineForHost", () => {
  const FLATPAK_ID = GLib.getenv("FLATPAK_ID");
  const command_line = `foo --bar hello='world' something="wow"`;

  GLib.setenv("FLATPAK_ID", "", true);
  assert.equal(prefixCommandLineForHost(command_line), command_line);

  GLib.setenv("FLATPAK_ID", "bar.foo", true);
  assert.equal(
    prefixCommandLineForHost(command_line),
    `flatpak-spawn --host foo --bar hello='world' something="wow"`,
  );

  if (FLATPAK_ID) GLib.setenv("FLATPAK_ID", FLATPAK_ID, true);
});

export default test;
