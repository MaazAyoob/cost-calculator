/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEVELOPMENT_FULL_PDF_TESTING?: string;
  readonly DEVELOPMENT_FULL_PDF_TESTING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
