import { create } from "zustand";

interface IStore {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  initTheme: () => void;
}

export const useAppStore = create<IStore>((set, get) => ({
  theme: "light",
  setTheme(theme) {
    const oldTheme =
      get().theme ?? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    // Update the theme
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

    // This callback will fire if the perferred color scheme changes without a reload
    mq.addEventListener("change", (evt) => {
      const theme = evt.matches ? "dark" : "light";

      get().setTheme(theme);
    });
  },
}));
