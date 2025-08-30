import { SyncWorkerCommands } from "../enums/syncWorkerCommands";

export interface ISyncWorkerCommand {
  command: SyncWorkerCommands;
  data: unknown;
}
