import {
  FetchQueryOptions,
  QueryKey,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export function useLazyQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const queryClient = useQueryClient();

  const [data, setData] = useState<TData>();
  const [isLoading, setIsLoading] = useState(false);

  const trigger = useCallback(
    async (queryKey: TQueryKey) => {
      setIsLoading(true);

      return await queryClient
        .ensureQueryData<
          TQueryFnData,
          TError,
          TData,
          TQueryKey
        >({ queryKey, queryFn: options.queryFn })
        .then((res) => {
          setData(res);
          setIsLoading(false);

          return res;
        });
    },
    [options, queryClient, options.queryFn]
  );

  const result = useMemo(
    () => ({
      trigger,
      isLoading,
      data,
    }),
    [data, isLoading, trigger]
  );

  return result;
}
