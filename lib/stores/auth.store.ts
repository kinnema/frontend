import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ILoginResponse, IUser } from "../models";

interface IStore {
  access_token?: string;
  user?: IUser;
  isLoggedIn: boolean;
  setUser: (data: ILoginResponse) => void;
  logOut: () => void;
}

export const useAuthStore = create(
  persist<IStore>(
    (set, get) => ({
      isLoggedIn: false,
      access_token: undefined,
      user: undefined,
      setUser(data) {
        set({
          access_token: data.access_token,
          user: data.user,
          isLoggedIn: true,
        });
      },
      logOut() {
        set({ access_token: undefined, user: undefined, isLoggedIn: false });
      },
    }),
    {
      name: "auth",
    }
  )
);
