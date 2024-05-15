declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    REQUEST_DOMAIN: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    LIVE_KEYWORDS_URL: string;
  }
}
