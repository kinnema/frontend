import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-zinc-800 bg-black/95">
      <div className="container px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">{t("footer.copyright")}</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4">
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              {t("footer.privacy")}
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              {t("footer.terms")}
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              {t("footer.help")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
