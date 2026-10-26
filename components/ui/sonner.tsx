"use client";

import {
  CheckCircleIcon,
  CircleNotchIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";

/** App-wide toast host on the z-50 layer: top-centre on phones, bottom-right on desktop, clear of the controls. */
function Toaster({ style, ...props }: ToasterProps) {
  const desktop = useMediaQuery("(min-width: 768px)");

  return (
    <Sonner
      theme="light"
      position={desktop ? "bottom-right" : "top-center"}
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="size-4 text-success-600" weight="fill" />,
        info: <InfoIcon className="size-4 text-ink-700" weight="fill" />,
        warning: <WarningIcon className="size-4 text-warning-600" weight="fill" />,
        error: <XCircleIcon className="size-4 text-danger-600" weight="fill" />,
        loading: <CircleNotchIcon className="size-4 animate-spin text-ink-500" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          zIndex: 50,
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "font-sans shadow-pop",
          description: "text-ink-500!",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
