"use client";

import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../stores/auth.store";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
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

  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-black/0">
      <div className="px-4 md:px-6 flex items-center justify-between py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2">
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
          <Link href="/search">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          {isLoggedIn ? (
            <UserNav />
          ) : (
            <Link href="/login" passHref>
              <Button>Giriş Yap</Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-white/10 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
