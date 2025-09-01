import { Capacitor } from "@capacitor/core";

export const isElectron = () => {
  return typeof window !== "undefined" && window.electronAPI !== undefined;
};

export function isNativePlatform() {
  return isElectron() || Capacitor.isNativePlatform();
}
