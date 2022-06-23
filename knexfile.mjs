// Configuration
// require("dotenv").config();
import dotenv from "dotenv";

dotenv.config();

export const configs = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
  },
};
