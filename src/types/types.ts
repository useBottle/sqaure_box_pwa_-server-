export interface Item {
  title: string;
  description: string;
  pubDate: string;
  originallink: string;
  link: string;
  imageUrls: string[];
  articleText: string;
  charset?: string;
}

export interface YoutubeResponse {
  etag: string;
  items: Array<{
    etag: string;
    id: {
      kind: string;
      videoId: string;
    };
    kind: string;
    snippet: {
      publishedAt: string;
      channelId: string;
    };
  }>;
  kind: string;
  nextPageToken: string;
  pageInfo: {
    resultsPerPage: number;
    totalResults: number;
  };
  regionCode: string;
}

export interface videoIdData {
  link: string;
}
