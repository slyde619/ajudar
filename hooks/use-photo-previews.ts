"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PhotoPreview {
  id: string;
  url: string;
  name: string;
  file: File;
}

/** Local previews for picked photos, revoked on remove and unmount. */
export function usePhotoPreviews(max: number) {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const urls = useRef(new Set<string>());

  useEffect(() => {
    const owned = urls.current;
    return () => {
      owned.forEach((url) => URL.revokeObjectURL(url));
      owned.clear();
    };
  }, []);

  const add = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const room = Math.max(0, max - photos.length);
      const next = Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, room)
        .map((file) => {
          const url = URL.createObjectURL(file);
          urls.current.add(url);
          return { id: url, url, name: file.name, file };
        });
      setPhotos((current) => [...current, ...next]);
    },
    [max, photos.length],
  );

  const remove = useCallback((id: string) => {
    setPhotos((current) => {
      const photo = current.find((entry) => entry.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.url);
        urls.current.delete(photo.url);
      }
      return current.filter((entry) => entry.id !== id);
    });
  }, []);

  const replace = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      photos.forEach((photo) => {
        URL.revokeObjectURL(photo.url);
        urls.current.delete(photo.url);
      });
      const next = Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, max)
        .map((file) => {
          const url = URL.createObjectURL(file);
          urls.current.add(url);
          return { id: url, url, name: file.name, file };
        });
      setPhotos(next);
    },
    [max, photos],
  );

  return { photos, add, remove, replace };
}
