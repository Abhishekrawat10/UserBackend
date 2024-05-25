const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const zod = require("zod");
const { User, Doc } = require("../db");
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

router.post("/create-user", authMiddleware, async (req, res) => {
  const { success } = userSchema.safeParse(req.body);
  const user = req.User;

  if (!success) {
    return res.status(400).json({
      error: "Wrong Credentials",
      message: "Enter the credentials Properly",
    });
  }

  const currUser = await User.findOne({ username: user });
  if (currUser.role !== "Super Admin") {
    return res.status(403).json({
      message: "You can't create Users",
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
  const user = req.User;
  try {
    const currUser = await User.findOne({ username: user });

    if (currUser.role !== "Super Admin") {
      return res.status(403).json({
        message: "You can't Assign the Role",
      });
    }

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

router.post("/create-doc", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const author = req.User;

  try {
    const findUser = await User.findOne({ username: author });
    // console.log(findUser);

    if (findUser.role === "Super Admin" || findUser.role === "Admin") {
      const findDoc = await Doc.findOne({ title });
      if (findDoc) {
        return res.status(411).json({
          message: "Doc already Exist witht this name",
        });
      }
      await Doc.create({
        title,
        content,
        author: findUser._id,
      });

      return res.status(201).json({
        message: "Doc Created Successfully",
      });
    } else {
      return res.status(403).json({
        message: "You can't Create a doc",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.get("/doc/:docName", authMiddleware, async (req, res) => {
  const docName = req.params.docName;
  const username = req.User;
  try {
    const findDoc = await Doc.findOne({ title: docName });

    if (!findDoc) {
      return res.status(400).json({
        message: "Doc don't exist",
      });
    }

    // Here docAccess 0 means that the user can only view the doc can't edit the doc sending it here only so that on frontend we can disable his edititng on docs
    let docAccess = 0;
    const findUser = await User.findOne({ username });

    if (findUser.role === "Super Admin" || findUser.role === "Admin") {
      // docAcess 1 means can edit and udpate the doc
      docAccess = 1;
    }

    return res.status(200).json({
      findDoc,
      docAccess,
      message: "Here is your Doc",
    });
  } catch (err) {
    return res.status(500).json({
      err,
      messsage: "Internal Server Error",
    });
  }
});

router.post("/update-doc/:docName", authMiddleware, async (req, res) => {
  const docName = req.params.docName;
  const username = req.User;
  try {
    const findUser = await User.findOne({
      username,
    });

    if (findUser.role !== "Super Admin" && findUser.role !== "Admin") {
      return res.status(403).json({
        message: "Can't Edit the doc",
      });
    }

    const newDoc = await Doc.findOneAndUpdate({ title: docName }, req.body, {
      new: true,
    });

    if (!newDoc) {
      return res.status(404).json({
        message: "Doc not found",
      });
    }
    return res.status(200).json({
      newDoc,
      message: "Your Doc Updated Succesffully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
