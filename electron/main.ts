import { app, BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import { fsIpcHandlers } from "./fs";

const isDev = process.env.NODE_ENV === "development";

function createWindow(): void {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false, // Disable web security to bypass CORS
    },
    icon: path.join(__dirname, "../public/icons/icon-256x256.png"),
    titleBarStyle: "default",
    show: false, // Don't show until ready-to-show
  });

  // Disable CORS by modifying headers
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      details.requestHeaders["User-Agent"] = "VLC/3.0.17.4 LibVLC/3.0.9";
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Access-Control-Allow-Origin": ["*"],
          "Access-Control-Allow-Methods": ["GET, POST, PUT, DELETE, OPTIONS"],
          "Access-Control-Allow-Headers": ["*"],
          "Access-Control-Allow-Credentials": ["true"],
        },
      });
    }
  );

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, "../dist/index.html")}`);
  }

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle navigation to external URLs
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (
      parsedUrl.origin !== "http://localhost:3000" &&
      !navigationUrl.startsWith("file://")
    ) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  fsIpcHandlers(ipcMain);
  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
});
