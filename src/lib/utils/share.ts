import { Share, ShareOptions } from "@capacitor/share";

export async function share(options: ShareOptions) {
  const canShare = await Share.canShare();

  if (canShare.value) {
    try {
      await Share.share(options);
    } catch (error) {
      window.navigator.clipboard.writeText(options.url ?? options.text ?? "");
    }
  } else {
    window.navigator.clipboard.writeText(options.url ?? options.text ?? "");
  }
}
