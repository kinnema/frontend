import { toast } from "@/hooks/use-toast";
import { nip19 } from "nostr-tools";
import { BehaviorSubject, tap } from "rxjs";

export const nostrId$ = new BehaviorSubject<string>(
  localStorage.getItem("nostr-secret-key") || ""
);

nostrId$
  .pipe(
    tap((newValue) => {
      try {
        nip19.decode(newValue).data as Uint8Array;
        console.log("Nostr ID changed to:", newValue);
        localStorage.setItem("nostr-secret-key", newValue);
      } catch (error) {
        toast({
          title: "Invalid Nostr ID",
          description: "Please enter a valid Nostr secret key.",
          variant: "destructive",
          duration: 1000,
        });

        console.error("Failed to initialize Nostr keys:", error);
      }
    })
  )
  .subscribe();
