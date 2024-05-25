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

const docSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
const Doc = mongoose.model("Doc", docSchema);

module.exports = {
  User,
  Doc
};
