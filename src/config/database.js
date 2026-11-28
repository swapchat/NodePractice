require("node:dns").setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");

const connectDB = async () => {
  const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_CLUSTER } = process.env;

  if (!MONGODB_USERNAME || !MONGODB_PASSWORD || !MONGODB_CLUSTER) {
    throw new Error(
      "Missing MONGODB_USERNAME, MONGODB_PASSWORD, or MONGODB_CLUSTER in .env",
    );
  }

  const username = encodeURIComponent(MONGODB_USERNAME);
  const password = encodeURIComponent(MONGODB_PASSWORD);

  await mongoose.connect(
    `mongodb+srv://${username}:${password}@${MONGODB_CLUSTER}/DevTinder`,
  );
};

module.exports = connectDB;
