import Gio from "gi://Gio";

let settings;
try {
  settings = new Gio.Settings({
    schema_id: "re.sonny.Junction",
    path: "/re/sonny/Junction/",
  });
} catch {
  //
}

export { settings };
