import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Check, PencilIcon } from "lucide-react";
import { nip19 } from "nostr-tools";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSyncStore } from "../stores/sync.store";

export function NostrIdInput() {
  const id = useSyncStore((state) => state.nostrSecretKey);
  const setId = useSyncStore((state) => state.setNostrSecretKey);
  const [_id, _setId] = useState<string>(id ?? "");
  const [editingId, setEditingId] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    _setId(e.target.value);
  };

  const saveChanges = () => {
    try {
      const decoded = nip19.decode(_id);
      setEditingId(false);
      setId(_id);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: t("sync.toast.invalidNostrIdTitle"),
        description: t("sync.toast.invalidNostrIdDescription"),
        variant: "destructive",
      });
      console.error("Invalid Nostr ID:", error);
      return;
    }
  };

  const restoreChanges = () => {
    _setId(id ?? "");
    setEditingId(false);
  };

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{t("sync.nostrIdLabel")}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Input
          className="max-w-xs"
          value={_id}
          readOnly={!editingId}
          onChange={(e) => handleChange(e)}
        />
        <Button
          variant={!editingId ? "outline" : "default"}
          size="icon"
          onClick={editingId ? () => saveChanges() : () => setEditingId(true)}
        >
          {!editingId ? <PencilIcon size={16} /> : <Check size={16} />}
        </Button>

        {editingId && (
          <Button
            variant={"destructive"}
            size="icon"
            onClick={() => restoreChanges()}
          >
            Cancel
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(id ?? "");
          }}
        >
          {t("sync.copy")}
        </Button>
      </p>
    </div>
  );
}
