"use client";
import { useEffect, useState } from "react";
import type { Book } from "./types";
const BASE = "https://us-central1-summaristt.cloudfunctions.net";
export function useBooks(path: string | null) {
  const [state, setState] = useState<{
    path: string | null;
    data: Book[] | Book | null;
    error: string;
  }>({ path, data: null, error: "" });
  const [attempt, retry] = useState(0);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let active = true;
    setState({ path, data: null, error: "" });
    fetch(BASE + path, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Unable to load books.");
        return r.json();
      })
      .then((data) => {
        if (
          !data ||
          typeof data !== "object" ||
          (!Array.isArray(data) && !data.id)
        )
          throw new Error("The book service returned an invalid response.");
        if (active) setState({ path, data, error: "" });
      })
      .catch(() => {
        if (active)
          setState({
            path,
            data: null,
            error: "Unable to load books. Please try again.",
          });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [path, attempt]);
  return {
    ...(state.path === path ? state : { data: null, error: "" }),
    retry: () => retry((n) => n + 1),
  };
}
const durationCache = new Map<string, number>();
export function useDuration(url: string | undefined) {
  const [duration, setDuration] = useState<number | undefined>(() =>
    url ? durationCache.get(url) : undefined,
  );
  useEffect(() => {
    setDuration(url ? durationCache.get(url) : undefined);
    if (!url) return;
    if (durationCache.has(url)) {
      setDuration(durationCache.get(url));
      return;
    }
    const audio = new Audio();
    audio.preload = "metadata";
    const loaded = () => {
      if (Number.isFinite(audio.duration)) {
        durationCache.set(url, audio.duration);
        setDuration(audio.duration);
      }
    };
    audio.addEventListener("loadedmetadata", loaded);
    audio.src = url;
    return () => {
      audio.removeEventListener("loadedmetadata", loaded);
      audio.removeAttribute("src");
      audio.load();
    };
  }, [url]);
  return duration;
}
