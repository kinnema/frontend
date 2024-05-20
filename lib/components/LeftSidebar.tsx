"use client";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome } from "react-icons/fi";
import { useAppStore } from "../stores/app.store";

const navLinks = [
  {
    name: "Ana Sayfa",
    href: "/",
    icon: <FiHome />,
  },
  {
    name: "Gain",
    href: "/collection/gain",
  },
];

export function LeftSidebar() {
  const pathName = usePathname();
  const setTheme = useAppStore((state) => state.setTheme);
  const theme = useAppStore((state) => state.theme);
  return (
    <aside className=" w-1/6 py-10 pl-10  min-w-min  border-r border-gray-300 dark:border-zinc-700  hidden md:block ">
      <Link href="/">
        <div className=" font-bold text-lg flex items-center gap-x-3">
          <svg
            className="h-8 w-8 fill-red-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M10 15.5v-7c0-.41.47-.65.8-.4l4.67 3.5c.27.2.27.6 0 .8l-4.67 3.5c-.33.25-.8.01-.8-.4Zm11.96-4.45c.58 6.26-4.64 11.48-10.9 10.9 -4.43-.41-8.12-3.85-8.9-8.23 -.26-1.42-.19-2.78.12-4.04 .14-.58.76-.9 1.31-.7v0c.47.17.75.67.63 1.16 -.2.82-.27 1.7-.19 2.61 .37 4.04 3.89 7.25 7.95 7.26 4.79.01 8.61-4.21 7.94-9.12 -.51-3.7-3.66-6.62-7.39-6.86 -.83-.06-1.63.02-2.38.2 -.49.11-.99-.16-1.16-.64v0c-.2-.56.12-1.17.69-1.31 1.79-.43 3.75-.41 5.78.37 3.56 1.35 6.15 4.62 6.5 8.4ZM5.5 4C4.67 4 4 4.67 4 5.5 4 6.33 4.67 7 5.5 7 6.33 7 7 6.33 7 5.5 7 4.67 6.33 4 5.5 4Z"></path>
          </svg>
          <div className="tracking-wide dark:text-white">
            Kinnema<span className="text-red-600">.</span>
          </div>
        </div>
      </Link>
      <div className="mt-12 flex flex-col gap-y-4 text-gray-500 fill-gray-500 text-sm">
        <div className="text-gray-400/70  font-medium uppercase">Menu</div>

        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={classNames(
              "flex items-center space-x-2 py-1 dark:text-white font-semibold transition-all duration-200",
              pathName === link.href && " border-r-4 border-r-red-600"
            )}
          >
            <span>{link.icon}</span>
            <span>{link.name}</span>
          </Link>
        ))}

        <a className=" flex items-center space-x-2 py-1 mt-4" href="#">
          <label className="inline-flex items-center mb-5 cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={theme === "dark"}
              onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Karanlik mod
            </span>
          </label>
        </a>
      </div>
    </aside>
  );
}
