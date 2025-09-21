import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { SyncStatus } from "@/lib/features/sync/sync-status";
import { Link, useRouterState } from "@tanstack/react-router";
import classNames from "classnames";
import { Menu, Search, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../lib/constants";
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathName = useRouterState({ select: (s) => s.location.pathname });
  const oldPathname = useRef<string>(undefined);

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

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-black/0"
        style={{
          paddingTop: "var(--safe-area-inset-top)",
        }}
      >
        <div className="px-4 md:px-6 flex items-center justify-between gap-10 py-4">
          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-emerald-400"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold">kinnema</span>
            </Link>
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            {/* {isLoggedIn ? (
              <UserNav />
            ) : (
              <Link to="/" search={{ modal: 'login' }}>
                <Button>Giriş Yap</Button>
              </Link>
            )} */}
            <SyncStatus className="hidden md:inline-flex" showDetails={false} />
            <Link to="/search">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 hover:text-white"
              >
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-white/10 hover:text-white"
              onClick={toggleMenu}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div
        style={{
          marginTop: "var(--safe-area-inset-top)",
        }}
        className={classNames(
          "fixed left-0 bg-black w-full h-full z-50 flex flex-col p-8 transition-all duration-300",
          {
            "opacity-100 visible top-16": menuOpen,
            "opacity-0 invisible top-0": !menuOpen,
          }
        )}
      >
        <div className="flex flex-col h-full">
          <Link to="/search">
            <div className="relative items-center content-center flex w-full cursor-pointer">
              <span className="text-gray-400 absolute left-4 cursor-pointer">
                <SearchIcon size={15} />
              </span>
              <div className="text-xs ring-1 bg-zinc-900 ring-zinc-600 focus:ring-red-300 pl-10 pr-5 text-gray-600 dark:text-white  py-3 rounded-full w-full outline-none focus:ring-1 p-10 cursor-pointer">
                Ara..
              </div>
            </div>
          </Link>

          <ul className="flex flex-col justify-center items-center mt-10">
            {NAV_LINKS.map((link) => {
              if (link.type === "divider") {
                return (
                  <li
                    key={link.name}
                    className="text-center border-b border-border block w-full"
                  ></li>
                );
              }

              return (
                <li className="p-3 text-center" key={link.name}>
                  <Link
                    to={link.href ?? "#"}
                    className={classNames(
                      "flex items-center space-x-2 py-1 dark:text-white font-semibold transition-all duration-200",
                      "hover:text-primary",
                      "dark:hover:text-primary"
                    )}
                  >
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="m-auto">
            {/* {isLoggedIn && <Button onClick={onPressLogout}>Çıkış Yap</Button>} */}
          </div>
        </div>
      </div>
    </>
  );
}
