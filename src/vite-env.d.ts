/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SURFACE?: 'customer' | 'merchant';
  readonly VITE_ORDER_API_URL?: string;
  readonly VITE_LOCAL_DAEMON_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
