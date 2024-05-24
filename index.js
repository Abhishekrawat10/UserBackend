const express = require("express");
const port = 3000;
const mainRouter = require("./routes/mainIndex");
const cookieParser = require("cookie-parser");
// as our backend and fronend will be hosted on different routes therefore we need cors for that
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// app.get("/",(req,res)=>{
//   res.send("Hello ")
// })

app.use("/api/v1", mainRouter);

app.listen(port, () => {
  console.log(`port listening on http://localhost:${port}`);
});
