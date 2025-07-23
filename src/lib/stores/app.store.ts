import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IVersion {
  jsVersion: string;
  appVersion: string;
}

interface IStoreValues {
  theme: "dark" | "light";
  version: IVersion;
}

interface IStoreActions {
  setTheme: (theme: "dark" | "light") => void;
  initTheme: () => void;
}

type IStore = IStoreValues & IStoreActions;

export const useAppStore = create(
  persist<IStore>(
    (set, get) => ({
      theme: "light",
      version: {
        appVersion: "0.1.0",
        jsVersion: "0.1.0",
      },

      setVersion(version: IVersion) {
        set({
          version,
        });
      },
      setTheme(theme) {
        const oldTheme =
          (get().theme ??
          window.matchMedia("(prefers-color-scheme: dark)").matches)
            ? "dark"
            : "light";

        const classes = document.querySelector("html")?.classList;

        if (classes?.contains(oldTheme)) {
          classes.replace(oldTheme, theme);
        }

        classes?.add(theme);

        set({ theme });
      },
      initTheme() {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");

        if (mq.matches) {
          const theme = mq.matches ? "dark" : "light";

          get().setTheme(theme);
        }

        mq.addEventListener("change", (evt) => {
          const theme = evt.matches ? "dark" : "light";

          get().setTheme(theme);
        });
      },
    }),
    {
      name: "kinnema",
    }
  )
);
