import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useNostrSync } from "@/hooks/useNostrSync";
import { useState } from "react";
import { toast } from "sonner";

export function NostrSyncDangerZone() {
  const { deleteAllSyncData, deleteAllCollectionData, isSyncing } = useNostrSync();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDeleteAll = async () => {
    if (confirmDelete !== "DELETE ALL") {
      toast.error("Please type 'DELETE ALL' to confirm");
      return;
    }

    try {
      const result = await deleteAllSyncData();
      if (result.errors.length === 0) {
        toast.success(`Deleted ${result.deleted} events from Nostr relays`);
      } else {
        toast.error(`Deletion completed with errors: ${result.errors.join(", ")}`);
      }
    } catch (error) {
      toast.error("Failed to delete data from relays");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleDeleteCollection = async (collection: string) => {
    try {
      const result = await deleteAllCollectionData(collection as any);
      if (result.errors.length === 0) {
        toast.success(`Deleted ${result.deleted} ${collection} events`);
      } else {
        toast.error(`Deletion completed with errors`);
      }
    } catch (error) {
      toast.error(`Failed to delete ${collection} data`);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Permanently delete sync data from Nostr relays. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delete specific collections */}
        <div className="space-y-2">
          <h4 className="font-medium">Delete Collection Data</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteCollection("lastWatched")}
              disabled={isSyncing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Last Watched
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteCollection("watchlist")}
              disabled={isSyncing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Watchlist
            </Button>
          </div>
        </div>

        {/* Delete all data */}
        <div className="space-y-2">
          <h4 className="font-medium">Delete All Sync Data</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Type 'DELETE ALL' to confirm"
              value={confirmDelete || ""}
              onChange={(e) => setConfirmDelete(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={isSyncing || confirmDelete !== "DELETE ALL"}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Sync Data from Relays
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}