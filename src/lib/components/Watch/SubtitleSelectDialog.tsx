"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSubtitles } from "@/lib/hooks/useSubtitles";
import { useWatchStore } from "@/lib/stores/watch.store";
import { ILanguage } from "@/lib/types/language.type";
import { ISubtitleResult } from "@/lib/types/subtitle.type";
import { cn } from "@/lib/utils";
import { Check, Download, Globe, Languages, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface IProps {
  tmdbId: number;
  season: number;
  episode: number;
}

export function SubtitleSelectDialog({ tmdbId, season, episode }: IProps) {
  const setSubtitles = useWatchStore((state) => state.setSubtitles);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Globe className="h-4 w-4" />
          {currentLanguage?.name || "Select Language"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Select Subtitle Language
          </DialogTitle>
          <DialogDescription>
            Choose your preferred language from the list below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4 max-h-80 overflow-y-auto">
          <Input
            placeholder="Search"
            onChange={(text) => handleSearch(text.currentTarget.value)}
          />
          {languages.map((language) => (
            <div key={language.code} className="space-y-2">
              <button
                onClick={() => handleLanguageSelect(language.code)}
                disabled={loadingLanguage !== null}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border text-left transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed w-full",
                  selectedLanguage === language.code &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                  loadingLanguage === language.code &&
                    "bg-primary/80 text-primary-foreground"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{language.name}</span>
                  <span className="text-sm opacity-70">{language.code}</span>
                </div>
                {loadingLanguage === language.code ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : selectedLanguage === language.code ? (
                  <Check className="h-4 w-4" />
                ) : null}
              </button>
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
      </DialogContent>
    </Dialog>
  );
}
