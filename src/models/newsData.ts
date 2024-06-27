import mongoose from "mongoose";

const newsDataSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    pubDate: {
      type: String,
      required: true,
    },
    originallink: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    articleText: {
      type: String,
      required: true,
    },
  },
  { collection: "bookmark_news" },
);

const NewsData = mongoose.model("newsData", newsDataSchema);

export default NewsData;
