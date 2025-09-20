import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import { isNativePlatform } from "@/lib/utils/native";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface Setting {
  name: string;
  sub: Array<{
    name: string;
    href: string;
    nativeOnly?: boolean;
    translationKey?: string;
  }>;
  translationKey?: string;
}

const SETTINGS: Setting[] = [
  {
    name: "App",
    translationKey: "settings.app",
    sub: [
      {
        name: "Language",
        href: "/settings/language",
        translationKey: "settings.language",
      },
      {
        name: "Plugins",
        href: "/plugins",
        translationKey: "settings.plugins",
      },
      {
        name: "Updates",
        href: "updates",
        translationKey: "settings.updates",
      },
      {
        name: "Subtitles",
        href: "/settings/subtitles",
        nativeOnly: true,
        translationKey: "settings.subtitles",
      },
      {
        name: "Experimental Features",
        href: "/settings/experimental",
        translationKey: "settings.experimental",
      },
    ],
  },
];

export default function AppSettingsFeature() {
  const { t } = useTranslation();
  const isSubtitlesFeatureEnabled = useExperimentalStore((state) =>
    state.isFeatureEnabled(ExperimentalFeature.Subtitles)
  );
  const menuEntriesBasedOnFeature = useMemo(() => {
    const entries = [];
    if (isSubtitlesFeatureEnabled) {
      entries.push({
        name: "Subtitles",
        href: "/settings/subtitles",
        translationKey: "settings.subtitles",
        nativeOnly: true,
      });
    }

    return entries;
  }, [isSubtitlesFeatureEnabled]);

  const settingsWithFeatures = useMemo(() => {
    return SETTINGS.map((setting) => {
      if (setting.name === "App") {
        return {
          ...setting,
          sub: [...setting.sub, ...menuEntriesBasedOnFeature],
        };
      }
      return setting;
    });
  }, [menuEntriesBasedOnFeature]);
  return (
    <Card className="w-full max-w-md mx-auto my-8 md:my-12">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {t("settings.title")}
        </CardTitle>
        <CardDescription>{t("settings.description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {settingsWithFeatures.map((setting) => (
          <div className="grid gap-4" key={setting.name}>
            <h3 className="text-lg font-semibold">
              {setting.translationKey
                ? t(setting.translationKey)
                : setting.name}
            </h3>

            {setting.sub.map((subMenu) => {
              if (subMenu.nativeOnly && !isNativePlatform()) {
                return null;
              }

              return (
                <Link to={subMenu.href} key={subMenu.name}>
                  <Button
                    variant="ghost"
                    className="justify-between w-full px-0"
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        {subMenu.translationKey
                          ? t(subMenu.translationKey)
                          : subMenu.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              );
            })}
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col gap-2"></CardFooter>
    </Card>
  );
}
