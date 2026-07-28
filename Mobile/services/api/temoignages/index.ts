import { api } from "../client";
import type { Temoignage, TemoignagesPublicResponse } from "./types";

/** Témoignages publiés (endpoint public). */
export const getTemoignagesPublic = async (): Promise<Temoignage[]> => {
  const res = await api.get<TemoignagesPublicResponse>(
    "/api/temoignages/public",
  );
  return res.data.temoignages ?? [];
};
