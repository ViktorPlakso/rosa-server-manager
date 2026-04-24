const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("appMeta", {
  name: "ROSA Cockpit",
  version: "1.0.0"
});
