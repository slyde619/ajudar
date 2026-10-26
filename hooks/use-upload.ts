"use client";

import { useCallback } from "react";
import { uploadTicketAction } from "@/app/_actions/onboarding";
import type { Result } from "@/lib/types";

/** Uploads a file through a presigned ticket and returns its URL. */
export function useUpload() {
  return useCallback(async (file: File): Promise<Result<string>> => {
    const ticket = await uploadTicketAction({ name: file.name, type: file.type, size: file.size });
    if (!ticket.ok) return ticket;
    const { uploadUrl, fileUrl, headers } = ticket.data;
    if (uploadUrl) {
      try {
        const response = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type, ...headers },
        });
        if (!response.ok) return { ok: false, error: { code: "UPLOAD_FAILED", message: "Upload failed. Check your signal and try again." } };
      } catch {
        return { ok: false, error: { code: "UPLOAD_FAILED", message: "Upload failed. Check your signal and try again." } };
      }
    }
    return { ok: true, data: fileUrl };
  }, []);
}
