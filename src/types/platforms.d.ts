// Global type definitions for different platforms

interface ElectronAPI {
  platform: string;
  versions: {
    app: string;
    electron: string;
    node: string;
    chrome: string;
  };
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
  // File system operations
  fs: {
    readFile: (path: string) => Promise<Uint8Array>;
    writeFile: (path: string, data: Uint8Array) => Promise<void>;
    mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
    readDir: (
      path: string
    ) => Promise<{ name: string; isFile: boolean; isDirectory: boolean }[]>;
    remove: (path: string, options?: { recursive?: boolean }) => Promise<void>;
    getTempDir: () => Promise<string>;
    join: (...paths: string[]) => string;
  };
  // Shell operations
  shell: {
    execute: (
      command: string,
      args: string[]
    ) => Promise<{ code: number; stdout: string; stderr: string }>;
  };
}

interface TauriAPI {
  __TAURI__: any;
}

interface CapacitorAPI {
  Capacitor: any;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    __TAURI__?: TauriAPI["__TAURI__"];
    Capacitor?: CapacitorAPI["Capacitor"];
  }
}

export {};
