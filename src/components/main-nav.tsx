import { NAV_LINKS } from "@/lib/constants";
import { Link } from "@tanstack/react-router";

export function MainNav() {
  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-6">
        {NAV_LINKS.map((item) => {
          if (item.type === "divider") return;

          return (
            <li key={item.name}>
              <Link
                href={item.href ?? "#"}
                className="text-sm font-medium transition-colors hover:text-white/70"
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
