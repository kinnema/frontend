import { contextBridge, ipcRenderer } from "electron";

interface ElectronAPI {
  platform: string;
  versions: NodeJS.ProcessVersions;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
  fs: {
    tempDir: () => Promise<string>;
    join: (...paths: string[]) => Promise<string>;
    createFile: (fileName: string, data: string | Uint8Array) => Promise<void>;
    createDir: (dirName: string) => Promise<void>;
    unzipSubtitle: (filePath: string, destDir: string) => Promise<void>;
    readDir: (
      dirPath: string
    ) => Promise<{ name: string; isFile: boolean; isDirectory: boolean }[]>;
    removeFile: (filePath: string) => Promise<void>;
    readFile: (filePath: string) => Promise<Uint8Array>;
  };
}

const electronAPI: ElectronAPI = {
  platform: process.platform,
  versions: process.versions,

  invoke: (channel: string, ...args: any[]) =>
    ipcRenderer.invoke(channel, ...args),
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ["update-available", "update-downloaded"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  removeAllListeners: (channel: string) =>
    ipcRenderer.removeAllListeners(channel),

  fs: {
    tempDir: () => ipcRenderer.invoke("fs:tempDir"),
    join: (...paths: string[]) => ipcRenderer.invoke("fs:join", ...paths),
    createFile: (fileName: string, data: string | Uint8Array) =>
      ipcRenderer.invoke("fs:createFile", fileName, data),
    createDir: (dirName: string) => ipcRenderer.invoke("fs:createDir", dirName),
    unzipSubtitle: (filePath: string, destDir: string) =>
      ipcRenderer.invoke("fs:unzipSubtitle", filePath, destDir),
    readDir: (dirPath: string) => ipcRenderer.invoke("fs:readDir", dirPath),
    removeFile: (filePath: string) =>
      ipcRenderer.invoke("fs:removeFile", filePath),
    readFile: (filePath: string) => ipcRenderer.invoke("fs:readFile", filePath),
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

// Declare global types for the renderer process
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
