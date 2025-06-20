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
import { usePlugins } from "@/hooks/use-plugins";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

export default function PluginManager() {
  const { plugins, registerPlugin, unregisterPlugin } = usePlugins();
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
      <ul className="flex ">
        {Object.values(plugins).length === 0 && (
          <li>Herhangi bir eklenti bulunamadi</li>
        )}
        {Object.values(plugins).map((plugin) => (
          <li key={plugin.name}>
            <Card>
              <CardHeader>
                <CardTitle>{plugin.name}</CardTitle>
                <CardDescription>{plugin.manifest.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Versiyon: {plugin.manifest.version}</p>
              </CardContent>
              <CardFooter>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => unregisterPlugin(plugin.name)}
                >
                  Kaldir
                </Button>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
