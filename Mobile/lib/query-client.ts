import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min
      gcTime: 1000 * 60 * 60 * 24, // 24 h (cache conservé pour la lecture hors-ligne)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Persistance du cache pour la lecture hors-ligne (données déjà chargées).
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "bhs_query_cache",
});
