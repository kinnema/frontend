import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
];

export default function LanguageSettingsFeature() {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setSelectedLanguage(languageCode);
  };

  return (
    <Card className="w-full max-w-md mx-auto my-8 md:my-12">
      <CardHeader className="text-center">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </Link>
        </div>
        <CardTitle className="text-2xl font-bold">
          {t("settings.language")}
        </CardTitle>
        <CardDescription>{t("language.description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4">
          <label className="text-sm font-medium">
            {t("language.selectLanguage")}
          </label>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder={t("language.selectLanguage")} />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{language.nativeName}</span>
                    <span className="text-muted-foreground">
                      ({language.name})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              {t("language.currentLanguage")}:{" "}
              <strong>
                {LANGUAGES.find((l) => l.code === selectedLanguage)?.nativeName}
              </strong>
            </p>
            <p>{t("language.restartNote")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
