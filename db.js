const mongoose = require("mongoose");
const { string } = require("zod");
const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to the Database");
  })
  .catch((err) => {
    console.log(err);
  });
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["Super Admin", "Admin", "Guest", "Default User"],
      default: "Default User",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
