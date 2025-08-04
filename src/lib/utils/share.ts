import { toast } from "@/hooks/use-toast";
import { Share, ShareOptions } from "@capacitor/share";

export async function share(options: ShareOptions) {
  const canShare = await Share.canShare();

  if (canShare.value) {
    try {
      await Share.share(options);
    } catch (error) {
      toast({
        title: "Kopyaladim!",
        description: "URL Kopyalandi!",
      });
      window.navigator.clipboard.writeText(options.url ?? options.text ?? "");
    }
  } else {
    toast({
      title: "Kopyaladim!",
      description: "URL Kopyalandi!",
    });
    window.navigator.clipboard.writeText(options.url ?? options.text ?? "");
  }
}
