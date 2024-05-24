const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const zod = require("zod");
const { User } = require("../db");
const bcrypt = require("bcrypt");
const authMiddleware = require("../authMiddleware");
const saltRounds = 10;

const userSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const findUser = await User.findOne({ username });

    if (!findUser) {
      return res.status(400).json({
        message: "User don't exist",
      });
    }

    const checkPassword = bcrypt.compareSync(password, findUser.password);

    if (!checkPassword) {
      return res.status(401).json({
        messag: "Wrong Password",
      });
    }

    const token = jwt.sign(
      {
        username,
      },
      JWT_SECRET
    );

    return res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json({
        message: "User Logged In",
      });
  } catch (err) {
    return res.status(500).json({
      error: err,
      message: "Intenal Server Error",
    });
  }
});

router.post("/create-user", async (req, res) => {
  const { success } = userSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      error: "Wrong Credentials",
      message: "Enter the credentials Properly",
    });
  }

  const { username, password } = req.body;

  const findUser = await User.findOne({ username });

  if (findUser) {
    return res.status(409).json({
      message: "User Already Exist with this Usename",
    });
  }

  // creating a new user
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "User Created Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});

router.post("/assing-role", authMiddleware, async (req, res) => {
  try {
    const { username, role } = req.body;
    const findUser = await User.findOne({ username });
    if (!findUser) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not Found",
      });
    }

    findUser.role = role;

    await findUser.save();

    return res.status(200).json({
      message: "Role has been assined",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
