"use client";

import { toast as sonner, type ExternalToast } from "sonner";

export type ToastTone = "message" | "success" | "info" | "warning" | "error";

function showToast(tone: ToastTone, message: string, options?: ExternalToast) {
  return tone === "message" ? sonner(message, options) : sonner[tone](message, options);
}

/** Returns `toast(tone, message)`, the app's only way to raise a toast. */
export function useToast() {
  return showToast;
}
