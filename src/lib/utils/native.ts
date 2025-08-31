import { Capacitor } from "@capacitor/core";

export const isElectron = () => {
  console.log(window.electronAPI);
  return typeof window !== "undefined" && window.electronAPI !== undefined;
};

export function isNativePlatform() {
  return isElectron() || Capacitor.isNativePlatform();
}
