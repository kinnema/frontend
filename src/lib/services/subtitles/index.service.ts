import { AbstractSubtitleService } from "./abstract.service";
import { SubDlService } from "./subdl.service";

export const subtitleProviders: {
  name: string;
  cls: typeof AbstractSubtitleService;
  enabled: boolean;
}[] = [
  {
    name: "subdl",
    cls: SubDlService,
    enabled: true,
  },
];

export class SubtitleServiceFactory {
  static getService(providerName: string): AbstractSubtitleService | undefined {
    switch (providerName) {
      case "subdl":
        return new SubDlService();
      default:
        return undefined;
    }
  }
}
