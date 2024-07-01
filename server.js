const setup = require("./db_setup");
const express = require("express");
const app = express();

app.use(express.json());

const session = require("express-session");
app.use(
  session({
    secret: "암호화키",
    resave: false,
    saveUninitialized: false,
  })
);

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", require("./routes/account"));
app.use("/", require("./routes/bankbook"));
// app.use("/post", require("./routes/post"));

app.get("/", async (req, res) => {
  try {
    res.render("index.ejs");
  } catch (err) {
    res.status(500).send("DB Fail.");
  }
});

app.listen(process.env.WEB_PORT, async () => {
  await setup();
});
