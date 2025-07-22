"use client";

import { App as CapApp } from "@capacitor/app";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

const BackButtonHandler = () => {
  const navigate = useNavigate();

  if (!Capacitor.isNativePlatform()) return;

  useEffect(() => {
    let listenerHandle: PluginListenerHandle | null = null;

    CapApp.addListener("backButton", () => {
      const currentPath = window.location.pathname;
      const canGoBack = window.history.length > 1;

      console.log("Back button pressed on:", currentPath);

      if (currentPath === "/role_menu" || !canGoBack) {
        console.log("Exiting app...");
        CapApp.exitApp();
      } else {
        console.log("Going back...");
        router.back();
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
