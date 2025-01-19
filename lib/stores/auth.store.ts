import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiAuthLoginPost200Response } from "../api";

interface IStore {
  user?: ApiAuthLoginPost200Response;
  isLoggedIn: boolean;
  setUser: (data: ApiAuthLoginPost200Response) => void;
  logOut: () => void;
}

export const useAuthStore = create(
  persist<IStore>(
    (set, get) => ({
      isLoggedIn: false,
      user: undefined,
      setUser(data) {
        set({
          user: data,
          isLoggedIn: true,
        });
      },
      logOut() {
        set({ user: undefined, isLoggedIn: false });
      },
    }),
    {
      name: "auth",
    }
  )
);
