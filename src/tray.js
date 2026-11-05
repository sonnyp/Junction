import Gio from "gi://Gio";
import GLib from "gi://GLib";

const ITEM_PATH = "/StatusNotifierItem";
const MENU_PATH = "/MenuBar";
const WATCHER = "org.kde.StatusNotifierWatcher";

const ITEM_XML = `
<node>
  <interface name="org.kde.StatusNotifierItem">
    <property name="Category" type="s" access="read"/>
    <property name="Id" type="s" access="read"/>
    <property name="Title" type="s" access="read"/>
    <property name="Status" type="s" access="read"/>
    <property name="IconName" type="s" access="read"/>
    <property name="ItemIsMenu" type="b" access="read"/>
    <property name="Menu" type="o" access="read"/>
    <method name="Activate"><arg type="i" direction="in"/><arg type="i" direction="in"/></method>
    <method name="SecondaryActivate"><arg type="i" direction="in"/><arg type="i" direction="in"/></method>
    <method name="ContextMenu"><arg type="i" direction="in"/><arg type="i" direction="in"/></method>
    <method name="Scroll"><arg type="i" direction="in"/><arg type="s" direction="in"/></method>
  </interface>
</node>`;

const MENU_XML = `
<node>
  <interface name="com.canonical.dbusmenu">
    <property name="Version" type="u" access="read"/>
    <property name="TextDirection" type="s" access="read"/>
    <property name="Status" type="s" access="read"/>
    <property name="IconThemePath" type="as" access="read"/>
    <method name="GetLayout">
      <arg type="i" direction="in"/>
      <arg type="i" direction="in"/>
      <arg type="as" direction="in"/>
      <arg type="u" direction="out"/>
      <arg type="(ia{sv}av)" direction="out"/>
    </method>
    <method name="GetGroupProperties">
      <arg type="ai" direction="in"/>
      <arg type="as" direction="in"/>
      <arg type="a(ia{sv})" direction="out"/>
    </method>
    <method name="Event">
      <arg type="i" direction="in"/>
      <arg type="s" direction="in"/>
      <arg type="v" direction="in"/>
      <arg type="u" direction="in"/>
    </method>
    <method name="AboutToShow">
      <arg type="i" direction="in"/>
      <arg type="b" direction="out"/>
    </method>
  </interface>
</node>`;

// Status notifier icon with a flat menu, works on KDE and GNOME with the AppIndicator extension
// items: { label, activate, checked?, radio? } or { separator: true }
export default function Tray({ items }) {
  const nodes = items.map((item, index) => ({ ...item, id: index + 1 }));

  function props(node) {
    if (node.separator) return { type: new GLib.Variant("s", "separator") };
    const result = { label: new GLib.Variant("s", node.label) };
    if (node.checked) {
      result["toggle-type"] = new GLib.Variant(
        "s",
        node.radio ? "radio" : "checkmark",
      );
      result["toggle-state"] = new GLib.Variant("i", node.checked() ? 1 : 0);
    }
    return result;
  }

  const connection = Gio.DBus.session;

  const menu = Gio.DBusExportedObject.wrapJSObject(MENU_XML, {
    Version: 3,
    TextDirection: "ltr",
    Status: "normal",
    IconThemePath: [],
    GetLayout() {
      const children = nodes.map(
        (node) => new GLib.Variant("(ia{sv}av)", [node.id, props(node), []]),
      );
      return [1, [0, {}, children]];
    },
    GetGroupProperties() {
      return nodes.map((node) => [node.id, props(node)]);
    },
    Event(id, eventId) {
      if (eventId !== "clicked") return;
      nodes.find((node) => node.id === id)?.activate?.();
    },
    // The layout is read again each time, so states are always current
    AboutToShow() {
      return true;
    },
  });
  menu.export(connection, MENU_PATH);

  const item = Gio.DBusExportedObject.wrapJSObject(ITEM_XML, {
    Category: "ApplicationStatus",
    Id: "re.sonny.Junction",
    Title: "Junction",
    Status: "Active",
    IconName: "re.sonny.Junction",
    ItemIsMenu: true,
    Menu: MENU_PATH,
    Activate() {},
    SecondaryActivate() {},
    ContextMenu() {},
    Scroll() {},
  });
  item.export(connection, ITEM_PATH);

  const name = "re.sonny.Junction.StatusNotifierItem";
  const owner_id = Gio.bus_own_name_on_connection(
    connection,
    name,
    Gio.BusNameOwnerFlags.NONE,
    null,
    null,
  );

  connection.call(
    WATCHER,
    "/StatusNotifierWatcher",
    WATCHER,
    "RegisterStatusNotifierItem",
    new GLib.Variant("(s)", [name]),
    null,
    Gio.DBusCallFlags.NONE,
    -1,
    null,
    (self, result) => {
      try {
        self.call_finish(result);
      } catch (err) {
        console.warn("No status notifier watcher, tray icon disabled", err.message);
      }
    },
  );

  // Dropping the name makes the host remove the icon
  return {
    destroy() {
      item.unexport();
      menu.unexport();
      Gio.bus_unown_name(owner_id);
    },
  };
}
