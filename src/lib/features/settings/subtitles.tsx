import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSubtitleStore } from "@/lib/stores/subtitle.store";

export default function SubtitleSettingsFeature() {
  const { providerConfig, setProviderApiKey, setProviderEnabled } =
    useSubtitleStore();

  const subdlConfig = providerConfig.subdl;

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProviderApiKey("subdl", e.target.value);
  };

  const handleEnabledChange = (enabled: boolean) => {
    setProviderEnabled("subdl", enabled);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Subtitle Settings</h2>
        <p className="text-muted-foreground">
          Configure subtitle providers and manage cached data.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Subdl Provider</h3>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="subdl-enabled">Enable Subdl</Label>
            <p className="text-sm text-muted-foreground">
              Enable or disable the Subdl.com provider.
            </p>
          </div>
          <Switch
            id="subdl-enabled"
            checked={subdlConfig?.enabled ?? true}
            onCheckedChange={handleEnabledChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subdl-api-key">Subdl API Key</Label>
          <Input
            id="subdl-api-key"
            type="password"
            placeholder="Enter your Subdl API key"
            value={subdlConfig?.apiKey || ""}
            onChange={handleApiKeyChange}
            disabled={!subdlConfig?.enabled}
          />
          <p className="text-sm text-muted-foreground">
            Your Subdl.com API key. This is stored locally.
          </p>
        </div>
      </div>
    </div>
  );
}
