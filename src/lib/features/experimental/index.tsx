import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { isNativePlatform } from "@/lib/utils/native";
import { AlertTriangle, Beaker, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ExperimentalFeaturesComponent() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { features, toggleFeature } = useExperimentalStore();

  const toggleFeatureWithChecks = (featureId: string) => {
    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;

    if (!isNativePlatform()) {
      toast({
        title: t("experimental.error.toggleFailed", "Cannot Toggle Feature"),
        description: t(
          "experimental.error.nativeOnly",
          "This feature is only available in the desktop application."
        ),
        variant: "destructive",
      });
      return;
    }

    toggleFeature(featureId);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Beaker className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t("experimental.title", "Experimental Features")}
              </h1>
              <p className="text-muted-foreground">
                {t(
                  "experimental.description",
                  "Try out new features before they're fully released"
                )}
              </p>
            </div>
          </div>
        </div>
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">
            {t("experimental.warning.title", "Experimental Features Warning")}
          </AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            {t(
              "experimental.warning.description",
              "These features are experimental and may be unstable, incomplete, or subject to change. Use them at your own risk and expect potential issues."
            )}
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          {features.map((feature) => (
            <Card key={feature.id} className="relative">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">
                      {feature.translationKey
                        ? t(feature.translationKey)
                        : feature.name}
                    </CardTitle>
                    <Badge
                      variant={feature.enabled ? "default" : "secondary"}
                      className={
                        feature.enabled ? "bg-orange-500 text-white" : ""
                      }
                    >
                      {feature.enabled
                        ? t("experimental.status.enabled", "Enabled")
                        : t("experimental.status.disabled", "Disabled")}{" "}
                    </Badge>
                    {feature.nativeOnly && (
                      <Badge>
                        {t("experimental.status.nativeOnly", "Native Only")}
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={() => toggleFeatureWithChecks(feature.id)}
                    aria-label={`Toggle ${feature.name}`}
                  />
                </div>
                <CardDescription className="text-base">
                  {t(
                    feature.descriptionTranslationKey || "",
                    feature.description
                  )}
                </CardDescription>
              </CardHeader>

              {(feature.warning || feature.warningTranslationKey) &&
                feature.enabled && (
                  <CardContent className="pt-0">
                    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
                      <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                        {feature.warningTranslationKey
                          ? t(feature.warningTranslationKey)
                          : feature.warning}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                )}
            </Card>
          ))}
        </div>
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  {t("experimental.info.title", "About Experimental Features")}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t(
                    "experimental.info.description",
                    "Experimental features help us test new functionality with early adopters. Your feedback is valuable in shaping these features before their full release."
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
