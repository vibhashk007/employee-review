require("dotenv").config();
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const db = require("./config/mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo(session);
const flash = require("connect-flash");
const customMware = require("./config/middleware.js");
const path = require("path");
const { PORT, SECRET_KEY } = process.env;

// Add the following lines to configure body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.static("assets"));
app.use(expressLayouts);

// extract style and script from sub pages into the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(
  session({
    secret: "secretkey",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 20,
    },
    store: new MongoStore(
      {
        mongooseConnection: db,
        autoRemove: "disable",
      },
      function (err) {
        console.log(err || "connect-mongodb setup ok");
      }
    ),
  })
);

app.use(passport.initialize());

app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(flash());

app.use(customMware.setFlash);

app.use("/", require("./routes"));

app.listen(PORT || 5000, (err) => {
  if (err) {
    console.log(`Error is running the server: ${err}`);
  }
  console.log(`server is running on port: ${PORT}`);
});
