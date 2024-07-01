const router = require("express").Router();
const setup = require("../db_setup");
const { ObjectId } = require("mongodb");

router.get("/list", async (req, res) => {
  const { mongodb } = await setup();
  showList(mongodb, req, res);
});

function showList(mongodb, req, res) {
  mongodb
    .collection("post")
    .find()
    .toArray()
    .then((result) => {
      let totalAmount = 0;
      result.forEach(item => {
        if (item.type === "입금") {
          totalAmount += item.amount;
        } else if (item.type === "출금") {
          totalAmount -= item.amount;
        }
      });
      res.render("list.ejs", { data: result, totalAmount });
    });
}

router.post("/delete", async (req, res) => {
  const { mongodb } = await setup();
  const { _id } = req.body;
  mongodb
    .collection("post")
    .deleteOne({ _id: new ObjectId(_id) })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

router.post("/update", async (req, res) => {
  const { mongodb } = await setup();
  const { _id, title, content, amount, date, type } = req.body;
  mongodb
    .collection("post")
    .updateOne(
      { _id: new ObjectId(_id) },
      { $set: { title, content, amount, date, type } }
    )
    .then(() => res.redirect("/post/list"))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

router.get("/enter", (req, res) => {
  res.render("enter.ejs");
});

router.post("/enter", async (req, res) => {
  const { mongodb } = await setup();
  const { title, content, amount, date, type } = req.body;
  mongodb
    .collection("post")
    .insertOne({ title, content, amount, date, type })
    .then(() => res.redirect("/post/list"))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

module.exports = router;
