import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: ["components/ui/sonner.tsx", "hooks/use-toast.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { name: "sonner", message: "Raise toasts with useToast() from @/hooks/use-toast." },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
