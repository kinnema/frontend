export interface IRelay {
  id: string;
  url: string;
  status: "connected" | "disconnected";
}
