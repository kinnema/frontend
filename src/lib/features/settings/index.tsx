"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isNativePlatform } from "@/lib/utils/native";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
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
        name: "Sync",
        href: "/settings/sync",
        translationKey: "settings.sync",
      },
    ],
  },
];

export default function AppSettingsFeature() {
  const { t } = useTranslation();
  return (
    <Card className="w-full max-w-md mx-auto my-8 md:my-12">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {t("settings.title")}
        </CardTitle>
        <CardDescription>{t("settings.description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {SETTINGS.map((setting) => (
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
                    <span>
                      {subMenu.translationKey
                        ? t(subMenu.translationKey)
                        : subMenu.name}
                    </span>
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
