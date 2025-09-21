import { useSync } from "./provider";

export function useDeleteNostrEvents() {
  const syncContext = useSync();

  const deleteNostrEvents = async (documentId: string): Promise<void> => {
    await syncContext.deleteNostrEvent(documentId);
  };

  return { deleteNostrEvents };
}
