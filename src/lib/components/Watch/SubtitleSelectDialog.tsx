import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useSubtitles } from "@/lib/hooks/useSubtitles";
import { useSubtitleStore } from "@/lib/stores/subtitle.store";
import { useWatchStore } from "@/lib/stores/watch.store";
import { ILanguage } from "@/lib/types/language.type";
import { ISubtitleResult } from "@/lib/types/subtitle.type";
import {
  Check,
  Download,
  Globe,
  InfoIcon,
  Languages,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface IProps {
  tmdbId: number;
  season: number;
  episode: number;
}

export function SubtitleSelectDialog({ tmdbId, season, episode }: IProps) {
  const setSubtitles = useWatchStore((state) => state.setSubtitles);
  const providerConfig = useSubtitleStore((state) => state.providerConfig);
  const isProvidersExists = useMemo(() => {
    return (
      Object.values(providerConfig).filter((provider) => provider.enabled)
        .length > 0 &&
      Object.values(providerConfig).filter((provider) => provider.apiKey)
        .length > 0
    );
  }, [providerConfig]);
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const rawLanguages = useRef<ILanguage[]>([]);
  const [loadingLanguage, setLoadingLanguage] = useState<string | null>(null);
  const [apiResults, setApiResults] = useState<{
    [key: string]: ISubtitleResult[];
  }>({});
  const { fetchSubtitles, downloadSubtitle } = useSubtitles({
    tmdbId,
    seasonNumber: season,
    episodeNumber: episode,
  });

  useEffect(() => {
    import("@/lib/static/lang.json").then((json) => {
      setLanguages(json.default);
      rawLanguages.current = json.default;
    });
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      setLoadingLanguage(languageCode);

      const data = await fetchSubtitles(languageCode);

      setApiResults(data);

      setSelectedLanguage(languageCode);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLanguage(null);
    }

    // Simulate API call
  };

  const handleDownload = async (provider: string, url: string) => {
    console.log(`Downloading language pack ${url} from ${provider}`);

    try {
      const blobUrl = await downloadSubtitle(provider, url);

      if (!blobUrl) return;

      toast({
        title: "Subtitle downloaded",
        description: "Subtitle downloaded successfully",
      });

      setOpen(false);
      setSubtitles([
        {
          lang: selectedLanguage,
          url: blobUrl,
        },
      ]);

      console.log("Blob URL:", blobUrl);

      fetch(blobUrl).then((response) => {
        response.blob().then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "subtitle.srt";

          window.document.querySelector("body")?.firstChild?.replaceWith(a);
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (query: string) => {
    const filteredLanguages = rawLanguages.current.filter((lang) =>
      lang.name.toLowerCase().includes(query.toLowerCase())
    );

    setLanguages(filteredLanguages);
  };

  const currentLanguage = languages.find(
    (lang) => lang.code === selectedLanguage
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Globe className="h-4 w-4" />
          {currentLanguage?.name || "Select Language"}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Select Subtitle Language
          </SheetTitle>
          <SheetDescription>
            Choose your preferred language from the list below.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 max-h-full overflow-y-auto pr-5">
          {!isProvidersExists && (
            <Alert variant="destructive" className="mt-5">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Configure Subtitle Providers!</AlertTitle>
              <AlertDescription>
                You have not configured any subtitle providers.
              </AlertDescription>
            </Alert>
          )}

          <Input
            placeholder="Search"
            className="mt-5"
            onChange={(text) => handleSearch(text.currentTarget.value)}
          />
          {languages.map((language) => (
            <div key={language.code}>
              <Button
                className="w-full justify-between"
                variant={
                  selectedLanguage === language.code ? "default" : "outline"
                }
                onClick={() => handleLanguageSelect(language.code)}
                disabled={loadingLanguage !== null || !isProvidersExists}
              >
                {language.name}
                {loadingLanguage === language.code ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : selectedLanguage === language.code ? (
                  <Check className="h-4 w-4" />
                ) : null}
              </Button>
              {selectedLanguage === language.code && (
                <div className="flex flex-col gap-3">
                  {Object.keys(apiResults).map((key) =>
                    Object.values(apiResults[key]!).map((result) => (
                      <div className="flex items-center justify-between pl-3 pr-1">
                        <span className="text-xs text-green-600 font-medium">
                          {key}: {result.name}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(key, result.url)}
                          className="h-6 px-2 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
