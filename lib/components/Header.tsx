"use client";

import classNames from "classnames";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";
import { NAV_LINKS } from "../constants";
import { useAuthStore } from "../stores/auth.store";
import Button from "./Button";
import AccountDropdown from "./Sidebar/AccountDropdown";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();
  const pathName = usePathname();
  const oldPathname = useRef<string>();

  useEffect(() => {
    if (oldPathname.current !== pathName) {
      setMenuOpen(false);
    } else {
      setMenuOpen(true);
    }
  }, [pathName]);

  useEffect(() => {
    if (!menuOpen) {
      oldPathname.current = undefined;
    }
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((state) => !state);
  }, [pathName]);

  const onClickSearch = useCallback(() => {
    setMenuOpen(false);
    router.push("/search");
  }, []);

  return (
    <header className="font-bold text-lg flex justify-between gap-10 md:hidden mb-12 relative ">
      <div className="flex justify-between items-center w-full gap-10 ">
        <Link href="/" className="flex gap-x-3 items-center">
          <svg
            className="h-8 w-8 fill-red-600 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M10 15.5v-7c0-.41.47-.65.8-.4l4.67 3.5c.27.2.27.6 0 .8l-4.67 3.5c-.33.25-.8.01-.8-.4Zm11.96-4.45c.58 6.26-4.64 11.48-10.9 10.9 -4.43-.41-8.12-3.85-8.9-8.23 -.26-1.42-.19-2.78.12-4.04 .14-.58.76-.9 1.31-.7v0c.47.17.75.67.63 1.16 -.2.82-.27 1.7-.19 2.61 .37 4.04 3.89 7.25 7.95 7.26 4.79.01 8.61-4.21 7.94-9.12 -.51-3.7-3.66-6.62-7.39-6.86 -.83-.06-1.63.02-2.38.2 -.49.11-.99-.16-1.16-.64v0c-.2-.56.12-1.17.69-1.31 1.79-.43 3.75-.41 5.78.37 3.56 1.35 6.15 4.62 6.5 8.4ZM5.5 4C4.67 4 4 4.67 4 5.5 4 6.33 4.67 7 5.5 7 6.33 7 7 6.33 7 5.5 7 4.67 6.33 4 5.5 4Z"></path>
          </svg>
          <div className="tracking-wide dark:text-white flex-1 justify-center items-center gap-">
            Kinnema
            <span className="text-red-600"> BETA</span>
          </div>
        </Link>

        <button onClick={toggleMenu}>
          {menuOpen ? (
            <FiX size={25} />
          ) : (
            <FiMenu size={25} className="dark:text-white" />
          )}
        </button>
      </div>
      <div
        className={classNames(
          "fixed left-0 dark:bg-zinc-900 bg-white w-full h-full z-10 flex flex-col p-8 transition-all duration-300",
          {
            "opacity-100 visible top-24": menuOpen,
            "opacity-0 invisible top-0": !menuOpen,
          }
        )}
      >
        <div className="flex flex-col justify-between h-full">
          <div
            className="relative items-center content-center flex w-full cursor-pointer"
            onClick={onClickSearch}
          >
            <span className="text-gray-400 absolute left-4 cursor-pointer">
              <FiSearch />
            </span>
            <div className="text-xs ring-1 bg-gray-200 dark:bg-zinc-600 ring-gray-200 dark:ring-zinc-600 focus:ring-red-300 pl-10 pr-5 text-gray-600 dark:text-white  py-3 rounded-full w-full outline-none focus:ring-1 p-10 cursor-pointer">
              Ara..
            </div>
          </div>

          <ul className="flex flex-col justify-center items-center mt-10">
            {NAV_LINKS.map((link) => (
              <li className="p-3 text-center" key={link.href}>
                <Link
                  key={link.name}
                  href={link.href}
                  className={classNames(
                    "flex items-center space-x-2 py-1 dark:text-white font-semibold transition-all duration-200",
                    "hover:text-red-600",
                    "dark:hover:text-red-600"
                  )}
                >
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="m-auto">
            {!isLoggedIn ? (
              <Link href="/login" passHref legacyBehavior>
                <Button>Giris yap</Button>
              </Link>
            ) : (
              <AccountDropdown />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
