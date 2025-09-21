import { getDb } from "@/lib/database/rxdb";
import { useEffect, useState } from "react";
import { useSyncStore } from "./store";

export function SyncDebug() {
  const [lastWatchedData, setLastWatchedData] = useState<any[]>([]);
  const [favoriteData, setFavoriteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { identity, isActive, nostrStatus, webrtcStatus } = useSyncStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const db = await getDb();

      const lastWatchedDocs = await db.lastWatched.find().exec();
      const lastWatchedJson = lastWatchedDocs.map((doc) => doc.toJSON());
      setLastWatchedData(lastWatchedJson);

      const favoriteDocs = await db.favorite.find().exec();
      const favoriteJson = favoriteDocs.map((doc) => doc.toJSON());
      setFavoriteData(favoriteJson);

      console.log("LastWatched data:", lastWatchedJson);
      console.log("Favorite data:", favoriteJson);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setLoading(false);
  };

  const triggerManualSync = async () => {
    try {
      const { syncEngine } = await import("./engine");
      console.log("Manual sync triggered - using restart method");
      await syncEngine.restart();
    } catch (error) {
      console.error("Failed to trigger sync:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="border rounded p-4">
        <h3 className="font-medium mb-4">🔍 Sync Debug</h3>

        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <h4 className="font-medium mb-2">Current Sync State:</h4>
          <div className="text-sm space-y-1">
            <div>Identity: {identity ? "✅ Set" : "❌ Not set"}</div>
            <div>Active: {isActive ? "✅ Running" : "❌ Stopped"}</div>
            <div>Nostr: {nostrStatus}</div>
            <div>WebRTC: {webrtcStatus}</div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Data"}
          </button>

          <button
            onClick={triggerManualSync}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
          >
            🔄 Force Bidirectional Sync
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>
            • Bidirectional sync: Publishes local data to Nostr AND fetches
            remote data
          </p>
          <p>• Conflict resolution: Most recently synced version wins</p>
          <p>• Periodic sync: Every 5 minutes when active</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h4 className="font-medium mb-2">
              LastWatched ({lastWatchedData.length} items)
            </h4>
            <div className="bg-gray-50 p-2 rounded text-xs max-h-40 overflow-y-auto">
              <pre>{JSON.stringify(lastWatchedData, null, 2)}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">
              Favorites ({favoriteData.length} items)
            </h4>
            <div className="bg-gray-50 p-2 rounded text-xs max-h-40 overflow-y-auto">
              <pre>{JSON.stringify(favoriteData, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
