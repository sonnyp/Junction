import Gio from "gi://Gio";

export const settings = new Gio.Settings({
  schema_id: "re.sonny.Junction",
  path: "/re/sonny/Junction/",
});

export class CommonSettings {

   static openedWindows = new Set();

}
