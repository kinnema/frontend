import Link from "next/link";

export const navItems = [
  { label: "BluTV", href: "/collection/blutv" },
  { label: "Gain", href: "/collection/gain" },
  { label: "Exxen", href: "/collection/exxen" },
  { label: "Netflix", href: "/collection/netflix" },
];

export function MainNav() {
  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-6">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-white/70"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
