import "gi://Gtk?version=4.0";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Xdp from "gi://Xdp";

import tst, { assert } from "../troll/tst/tst.js";

import {
  getIconFilename,
  parse,
  prefixCommandLineForHost,
  readResource,
} from "../src/util.js";

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
  assert.is(
    parse("http://example.com/query?q=random%2Fword").to_string(),
    "http://example.com/query?q=random%2Fword",
  );
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
  const command_line = `foo --bar hello='world' something="wow"`;

  const running_under_flatpak = Xdp.Portal.running_under_flatpak;

  Xdp.Portal.running_under_flatpak = () => false;
  assert.equal(prefixCommandLineForHost(command_line), command_line);
  assert.equal(
    prefixCommandLineForHost("flatpak-spawn foo"),
    "flatpak-spawn foo",
  );

  Xdp.Portal.running_under_flatpak = () => true;
  assert.equal(
    prefixCommandLineForHost(command_line),
    `flatpak-spawn --host foo --bar hello='world' something="wow"`,
  );
  assert.equal(
    prefixCommandLineForHost("flatpak-spawn foo"),
    "flatpak-spawn foo",
  );

  Xdp.Portal.running_under_flatpak = running_under_flatpak;
});

test("getIconFilename", () => {
  const running_under_flatpak = Xdp.Portal.running_under_flatpak;

  Xdp.Portal.running_under_flatpak = () => false;
  assert.equal(getIconFilename("/usr/share/hello.png"), "/usr/share/hello.png");
  Xdp.Portal.running_under_flatpak = () => true;
  assert.equal(
    getIconFilename("/usr/share/hello.png"),
    "/run/host/usr/share/hello.png",
  );

  Xdp.Portal.running_under_flatpak = () => false;
  assert.equal(getIconFilename("/etc/foo/hello.png"), "/etc/foo/hello.png");
  Xdp.Portal.running_under_flatpak = () => true;
  assert.equal(
    getIconFilename("/etc/foo/hello.png"),
    "/run/host/etc/foo/hello.png",
  );

  Xdp.Portal.running_under_flatpak = () => false;
  assert.equal(getIconFilename("/home/foo/bar.png"), "/home/foo/bar.png");
  Xdp.Portal.running_under_flatpak = () => true;
  assert.equal(getIconFilename("/home/foo/bar.png"), "/home/foo/bar.png");

  Xdp.Portal.running_under_flatpak = () => false;
  assert.equal(getIconFilename("/opt/foo/bar.png"), "/opt/foo/bar.png");
  Xdp.Portal.running_under_flatpak = () => true;
  assert.equal(getIconFilename("/opt/foo/bar.png"), "/opt/foo/bar.png");

  Xdp.Portal.running_under_flatpak = running_under_flatpak;
});

export default test;
