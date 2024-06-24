import mongoose from "mongoose";

const youtubeDataSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
      unique: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    channelHandle: {
      type: String,
      required: true,
    },
    channelThumbnail: {
      type: String,
      required: true,
    },
    channelTitle: {
      type: String,
      required: true,
    },
  },
  { collection: "bookmark_youtube" },
);

const YoutubeData = mongoose.model("youtubeData", youtubeDataSchema);

export default YoutubeData;
