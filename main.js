const { app, BrowserWindow, shell } = require("electron");

const COCKPIT_URL = process.env.COCKPIT_URL || "https://192.168.122.247:9090";
const ALLOW_INSECURE_LOCAL_CERT = process.env.ALLOW_INSECURE_LOCAL_CERT !== "0";
const WINDOW_TITLE = "ROSA Cockpit";
const ALLOWED_PORT = process.env.COCKPIT_PORT || "9090";
const EXTRA_ALLOWED_HOSTS = (process.env.COCKPIT_EXTRA_ALLOWED_HOSTS || "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

function isAllowedCockpitUrl(rawUrl) {
  if (!rawUrl) return false;

  if (rawUrl.startsWith("about:") || rawUrl.startsWith("data:") || rawUrl.startsWith("blob:")) {
    return true;
  }

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "wss:") return false;
    if (url.port !== ALLOWED_PORT) return false;

    if (EXTRA_ALLOWED_HOSTS.length === 0) return true;
    return EXTRA_ALLOWED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

function configureCertificateException() {
  if (!ALLOW_INSECURE_LOCAL_CERT) return;

  app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
    if (isAllowedCockpitUrl(url)) {
      event.preventDefault();
      callback(true);
      return;
    }

    callback(false);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1200,
    minHeight: 760,
    autoHideMenuBar: true,
    title: WINDOW_TITLE,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: `${__dirname}/preload.js`
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedCockpitUrl(url)) {
      return { action: "allow" };
    }

    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedCockpitUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error("Load error:", { errorCode, errorDescription, validatedURL });
  });

  win.loadURL(COCKPIT_URL);
}

app.whenReady().then(() => {
  configureCertificateException();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
