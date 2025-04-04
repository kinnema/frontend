"use client";

import { ShowCard } from "@/components/show-card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loading } from "@/lib/components/Loading";
import { usePlugin } from "@/lib/plugins/hooks/usePlugin";
import { usePlugins } from "@/lib/plugins/PluginProvider";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CatalogPage() {
  const router = useRouter();
  const { plugins } = usePlugins();
  const params = useParams();
  const plugin = usePlugin(params.catalog as string);
  const [catalog, setCatalog] = useState<string | null>(null);
  const s = useQuery({
    enabled: !!catalog,
    queryKey: ["catalog", params.catalog, catalog],
    queryFn: () => {
      if (!catalog) return null;

      const catalogData = plugin?.plugin.catalogs?.find(
        (c) => c.id === catalog
      );

      if (!catalogData) return null;

      console.log(catalogData);

      return plugin?.fetchCatalog(catalogData.type, catalogData.id);
    },
  });

  useEffect(() => {
    if (plugins.length === 0) return;

    const catalog = plugins
      .filter(
        (p) => p.id === params.catalog && p.resources.includes("catalog")
      )[0]
      ?.id.toLowerCase();

    if (catalog) {
      if (params.catalog !== catalog) {
        console.log("Redirecting to", catalog);
        router.push("/");
      }
    } else {
      console.log("No plugin found");
      router.push("/");
    }
  }, [plugins]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Catalog {plugin?.plugin.name}</h1>
      <div className="flex flex-col gap-2">
        <Select
          onValueChange={(value) => {
            setCatalog(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              {plugin?.plugin.catalogs?.map((catalog) => (
                <SelectItem key={catalog.id} value={catalog.id}>
                  {catalog.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {s.isFetching && s.isPending && <Loading />}

        {s.data !== null && (
          <div className="flex flex-wrap gap-2">
            {s.data?.metas.map((item) => (
              <ShowCard
                key={item.id}
                show={{
                  id: item.id,
                  title: item.name,
                  image: item.poster,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
