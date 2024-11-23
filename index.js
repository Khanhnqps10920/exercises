const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRouter = express.Router();
const uuid = require("uuid");
const moment = require("moment");

require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const users = [];

apiRouter.post("/", (req, res) => {
  const { username } = req.body;
  const newUser = {
    _id: uuid.v4(),
    username: username,
    exercises: [],
  };

  users.push(newUser);

  return res.json({
    username: newUser.username,
    _id: newUser._id,
  });
});

apiRouter.post("/:id/exercises", (req, res) => {
  const userId = req.params.id;

  const user = users.find((el) => el._id == userId);

  const { description, duration, date } = req.body;

  const format = "ddd MMM DD YYYY";
  const newExercise = {
    description,
    duration,
    date: date
      ? moment(date).format(format)
      : moment(new Date()).format(format),
  };

  user.exercises.push(newExercise);

  return res.json({
    username: user.username,
    _id: user._id,
    duration,
    description,
    date: newExercise.date,
  });
});

apiRouter.get("/:id/logs", (req, res) => {
  const { from, to, limit } = req.query;
  const userId = req.params.id;
  const user = users.find((el) => el._id == userId);

  const baseArr = user.exercises;

  if (from) {
    baseArr = baseArr.filter((el) => new Date(el.date) > new Date(from));
  }

  if (to) {
    baseArr = baseArr.filter((el) => new Date(el.date) < new Date(to));
  }

  if (limit) {
    baseArr = baseArr.splice(0, limit);
  }

  return {
    username: user.username,
    _id: user._id,
    count: baseArr.length,
    log: baseArr,
  };
});

app.use("/api/users", apiRouter);

app.post("/api/users");

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
