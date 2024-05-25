declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    REQUEST_DOMAIN: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    KEYWORDS_URL: string;
  }
}
