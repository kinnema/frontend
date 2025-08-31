import { app, IpcMain } from "electron";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

export function fsIpcHandlers(ipcMain: IpcMain) {
  ipcMain.handle("fs:tempDir", async () => {
    // Implementation
    return app.getPath("temp");
  });

  ipcMain.handle("fs:join", async (event, ...paths: string[]) => {
    // Filter out undefined/null values and ensure all remaining are strings
    const validPaths = paths.filter(
      (pathArg): pathArg is string =>
        pathArg != null && typeof pathArg === "string"
    );
    return path.join(...validPaths);
  });

  ipcMain.handle(
    "fs:createFile",
    async (event, fileName: string, data: string | Uint8Array) => {
      return fs.writeFile(fileName, data);
    }
  );

  ipcMain.handle("fs:removeFile", async (event, filePath: string) => {
    return fs.rm(filePath, {
      recursive: true,
    });
  });

  ipcMain.handle("fs:readFile", async (event, filePath: string) => {
    return fs.readFile(filePath);
  });

  ipcMain.handle("fs:createDir", async (event, dirPath: string) => {
    return fs.mkdir(dirPath, {
      recursive: true,
    });
  });

  ipcMain.handle(
    "fs:unzipSubtitle",
    async (event, filePath: string, destDir: string) => {
      // Implementation
      const unzip = await import("unzipper");
      await fsSync
        .createReadStream(filePath)
        .pipe(unzip.Extract({ path: destDir }))
        .promise();
    }
  );

  ipcMain.handle("fs:readDir", async (event, dirPath: string) => {
    return fs
      .readdir(dirPath, { withFileTypes: true, recursive: true })
      .then((dirents) => {
        return dirents.map((dirent) => {
          return {
            name: dirent.name,
            isFile: dirent.isFile(),
            isDirectory: dirent.isDirectory(),
          };
        });
      });
  });
}
