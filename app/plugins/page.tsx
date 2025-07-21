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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePluginRegistry } from "@/lib/plugins/usePluginRegistry";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

export default function PluginManager() {
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
      setError("Eklenti eklenirken bir hata oluştu");
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
      <h1 className="font-semibold text-2xl">Eklenti Yöneticisi</h1>
      <form
        onSubmit={handleAddPlugin}
        className="flex items-center mb-4 gap-10"
      >
        <Input
          className="my-5"
          type="url"
          placeholder="Eklenti URL'si"
          value={pluginUrl}
          onChange={(e) => setPluginUrl(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2Icon className="animate-spin mr-2" />}
          {loading ? "Ekleniyor" : "Eklenti Ekle"}
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
          ? "Guncelleniyor"
          : "Tum Eklentileri Guncelle"}
      </Button>

      <ul className="flex md:flex-row flex-col gap-5">
        {Object.values(plugins).length === 0 && (
          <li>Herhangi bir eklenti bulunamadi</li>
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
              </CardContent>
              <CardFooter>
                <div className="flex justify-between items-center gap-4">
                  <Switch
                    id={`enable-plugin-${plugin.id}`}
                    defaultChecked={plugin.enabled}
                    onCheckedChange={(checked) =>
                      handleTogglePlugin(plugin.id, checked)
                    }
                  />
                  <Label htmlFor={`enable-plugin-${plugin.id}`}>
                    Eklenti Durumu
                  </Label>
                  <Button
                    variant="outline"
                    style={{ marginLeft: 8 }}
                    onClick={() => handlePluginUpdate(plugin.id)}
                    disabled={
                      isUpdating?.isUpdating &&
                      isUpdating.pluginId === plugin.id
                    }
                  >
                    {isUpdating?.isUpdating === true &&
                    isUpdating.pluginId === plugin.id
                      ? "Guncelleniyor"
                      : "Guncelle"}
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={() => unregisterPlugin(plugin.id)}
                    variant="destructive"
                  >
                    Kaldir
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
