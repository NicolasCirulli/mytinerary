import { useState, useEffect } from "react";
import { fetchCityById } from "../services/cities.services";
import type { City } from "../cities.types";

export const useCityDetails = (id: string | undefined) => {
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCity = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await fetchCityById(id);
        setCity(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error fetching city details");
      } finally {
        setLoading(false);
      }
    };

    loadCity();
  }, [id]);

  return { city, loading, error };
};
