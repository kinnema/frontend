"use client";

import { App as CapApp } from "@capacitor/app";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

const BackButtonHandler = () => {
  const router = useRouter();

  if (!Capacitor.isNativePlatform()) return;

  useEffect(() => {
    let listenerHandle: PluginListenerHandle | null = null;

    CapApp.addListener("backButton", () => {
      const currentPath = window.location.pathname;
      const canGoBack = router.history.canGoBack();

      console.log("Back button pressed on:", currentPath);

      if (!canGoBack) {
        console.log("Exiting app...");
        CapApp.exitApp();
      } else {
        console.log("Going back...");
        router.history.back();
      }
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [router]);

  return null;
};

export default BackButtonHandler;
