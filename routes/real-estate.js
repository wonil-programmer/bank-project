const realEstateRouter = require("express").Router();
const setup = require("../db_setup");
const path = require("path");
const requireLogin = require("../middleware/requireLogin");
const { ObjectId } = require("mongodb");

// READ: 부동산 매물 조회
realEstateRouter.get("/realEstate", async (req, res) => {
  const { mongodb } = await setup();
  showRealEstateForsale(mongodb, req, res);
});
const showRealEstateForsale = async (mongodb, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await mongodb
      .collection("realEstateForsale")
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    const realEstateForsaleColl = mongodb.collection("realEstateForsale");
    const total = await realEstateForsaleColl.countDocuments(); // 총 문서 개수

    if (!result) {
      res.status(404).send("404 Not Found");
    }

    res.render("real-estate.ejs", {
      totalPages: Math.ceil(total / limit), // 총 페이지 수 계산
      currentPage: page, // 현재 페이지 번호
      data: result, // 페이지네이션된 데이터
      limit: limit, // 페이지 당 문서 수
    });
  } catch (err) {
    console.log("err:", err);
  }
};

// READ: 부동산 관심매물 조회
realEstateRouter.get("/wishlist", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/wishlist.html"));
});

module.exports = realEstateRouter;
