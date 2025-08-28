import { Capacitor } from "@capacitor/core";
import { isTauri } from "@tauri-apps/api/core";

export function isNativePlatform() {
  return isTauri() || Capacitor.isNativePlatform();
}
