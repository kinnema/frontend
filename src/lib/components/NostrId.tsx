import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { nostrId$ } from "../rxjs/nostrObservables";

export function NostrIdInput() {
  const [id, setId] = useState(nostrId$.getValue());
  const [editingId, setEditingId] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const subscription = nostrId$.subscribe((newId) => {
      setId(newId);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    nostrId$.next(e.target.value);
    setId(e.target.value);
  };

  const saveChanges = () => {
    nostrId$.next(id);
    setEditingId(false);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{t("sync.nostrIdLabel")}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Input
          className="max-w-xs"
          value={id}
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
