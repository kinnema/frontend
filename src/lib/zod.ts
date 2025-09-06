import i18next from "i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
// Import your language translation files
import translation from "zod-i18n-map/locales/tr/zod.json";

// lng and resources key depend on your locale.
// Note: This is separate from the main i18n setup for UI texts
const zodI18n = i18next.createInstance();

zodI18n.init({
  lng: "tr",
  resources: {
    tr: { zod: translation },
  },
});
z.setErrorMap(zodI18nMap);

// export configured zod instance
export { z };
