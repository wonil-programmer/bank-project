const router = require("express").Router();
const setup = require("../db_setup");

router.get("/post/list", async (req, res) => {
  const { mongodb } = await setup();
  showList(mongodb, req, res);
});

function showList(mongodb, req, res) {
  mongodb
    .collection("post")
    .find()
    .toArray()
    .then((result) => {
      res.render("list.ejs", { data: result });
    });
}

module.exports = router;
