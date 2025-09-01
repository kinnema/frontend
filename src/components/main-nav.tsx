import { NAV_LINKS } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function MainNav() {
  const { t } = useTranslation();

  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-6">
        {NAV_LINKS.map((item) => {
          if (item.type === "divider") return;

          return (
            <li key={item.name}>
              <Link
                to={item.href ?? "#"}
                className="text-sm font-medium transition-colors hover:text-white/70"
              >
                {item.translationKey ? t(item.translationKey) : item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
