"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlugins } from "@/hooks/use-plugins";
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
      setError(err?.message || "Failed to add plugin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Plugin Manager</h2>
      <form onSubmit={handleAddPlugin} style={{ marginBottom: 16 }}>
        <Input
          type="url"
          placeholder="Plugin URL"
          value={pluginUrl}
          onChange={(e) => setPluginUrl(e.target.value)}
          required
          style={{ marginRight: 8 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Plugin"}
        </button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {Object.values(plugins).length === 0 && <li>No plugins registered.</li>}
        {Object.values(plugins).map((plugin) => (
          <li key={plugin.name} style={{ marginBottom: 8 }}>
            <strong>{plugin.name}</strong> <br />
            <span>{plugin.manifest.description}</span>
            <br />
            <span>{plugin.manifest.version}</span>
            <br />
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => unregisterPlugin(plugin.name)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
