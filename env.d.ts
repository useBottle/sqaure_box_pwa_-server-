declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    REQUEST_DOMAIN: string;
    NAVER_API_CLIENT_ID: string;
    NAVER_API_CLIENT_SECRET: string;
    KEYWORDS_API_URL: string;
    YOUTUBE_API_URL: string;
    MONGODB_URI: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    NODE_ENV: string;
    RUNNING_SERVER: string;
  }
}
