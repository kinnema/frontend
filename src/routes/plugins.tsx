import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePluginRegistry } from "@/lib/plugins/usePluginRegistry";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function PluginManager() {
  const { t } = useTranslation();
  const {
    plugins,
    registerPlugin,
    unregisterPlugin,
    disablePlugin,
    enablePlugin,
    updatePlugins,
    updatePlugin,
    isUpdating,
  } = usePluginRegistry();
  const [pluginUrl, setPluginUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPlugin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerPlugin(pluginUrl);
      setPluginUrl("");
    } catch (err: any) {
      setError(t("plugins.addError"));
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlugin = (pluginId: string, enabled: boolean) => {
    if (enabled) {
      enablePlugin(pluginId);
    } else {
      disablePlugin(pluginId);
    }
  };

  const handleUpdateButton = async () => {
    await updatePlugins();
  };

  const handlePluginUpdate = async (pluginId: string) => {
    await updatePlugin(pluginId);
  };

  return (
    <div className="p-10">
      <h1 className="font-semibold text-2xl">{t("plugins.managerTitle")}</h1>
      <form
        onSubmit={handleAddPlugin}
        className="flex items-center mb-4 gap-10"
      >
        <Input
          className="my-5"
          type="url"
          placeholder={t("plugins.urlPlaceholder")}
          value={pluginUrl}
          onChange={(e) => setPluginUrl(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2Icon className="animate-spin mr-2" />}
          {loading ? t("plugins.adding") : t("plugins.addPlugin")}
        </Button>
      </form>
      {error && <div className="text-red-500 my-5">{error}</div>}

      <Button
        type="button"
        onClick={handleUpdateButton}
        disabled={isUpdating?.isUpdating && isUpdating.pluginId === "*"}
        className="my-5"
      >
        {isUpdating?.isUpdating && isUpdating.pluginId === "*" && (
          <Loader2Icon className="animate-spin mr-2" />
        )}
        {isUpdating?.isUpdating && isUpdating.pluginId === "*"
          ? t("plugins.updating")
          : t("plugins.updateAll")}
      </Button>

      <ul className="flex md:flex-row flex-col gap-5">
        {Object.values(plugins).length === 0 && (
          <li>{t("plugins.noPlugins")}</li>
        )}
        {Object.values(plugins).map((plugin) => (
          <li key={plugin.name}>
            <Card>
              <CardHeader>
                <CardTitle className={!plugin.enabled ? "text-gray-500" : ""}>
                  {plugin.name}
                </CardTitle>
                <CardDescription>{plugin.manifest.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Versiyon: {plugin.manifest.version}</p>
                <p>
                  {t("plugins.type")}:
                  {plugin.type === "local"
                    ? t("plugins.typeLocal")
                    : t("plugins.typeRemote")}
                </p>
                {plugin.type === "remote" && <p>URL: {plugin.url}</p>}
              </CardContent>
              <CardFooter>
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-5">
                    <Switch
                      id={`enable-plugin-${plugin.id}`}
                      defaultChecked={plugin.enabled}
                      onCheckedChange={(checked) =>
                        handleTogglePlugin(plugin.id, checked)
                      }
                    />
                    <Label htmlFor={`enable-plugin-${plugin.id}`}>
                      {t("plugins.status")}
                    </Label>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="outline"
                        style={{ marginLeft: 8 }}
                        onClick={() => unregisterPlugin(plugin.id)}
                      >
                        <ChevronDown size={230} />
                        {t("plugins.actions")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {plugin.type === "remote" && (
                        <DropdownMenuItem
                          onClick={() => handlePluginUpdate(plugin.id)}
                        >
                          {t("plugins.update")}
                        </DropdownMenuItem>
                      )}
                      {plugin.type === "remote" && (
                        <DropdownMenuItem
                          onClick={() => unregisterPlugin(plugin.id)}
                        >
                          {t("plugins.remove")}
                        </DropdownMenuItem>
                      )}
                      {plugin.type === "local" && (
                        <DropdownMenuItem disabled>
                          {t("plugins.localPluginNotEditable")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Route = createFileRoute("/plugins")({
  component: PluginManager,
});
