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

export interface NewsData {
  category: string;
  username: string;
  title: string;
  pubDate: string;
  originallink: string;
  imageUrl: string;
  articleText: string;
  _id: string;
}

export interface youtubeData {
  category: string;
  username: string;
  videoId: string;
  thumbnail: string;
  title: string;
  channelHandle: string;
  channelThumbnail: string;
  channelTitle: string;
  _id: string;
}

export interface findContent {
  newsData: NewsData[];
  youtubeData: youtubeData[];
}
