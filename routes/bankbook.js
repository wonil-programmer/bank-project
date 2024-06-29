const bankbookRouter = require("express").Router();
const setup = require("../db_setup");
const requireLogin = require("../middleware/requireLogin");
const { ObjectId } = require("mongodb");

bankbookRouter.use("/bankbook/transactionHistory", requireLogin);

// READ: 입출금 내역 확인
bankbookRouter.get("/bankbook/transactionHistory", async (req, res) => {
  const { mongodb } = await setup();
  showTransactionHistory(mongodb, req, res);
});
const showTransactionHistory = (mongodb, req, res) => {
  mongodb
    .collection("transactions")
    .find()
    .toArray()
    .then((result) => {
      res.render("bankbook.ejs", { data: result });
    });
};

// UPDATE: 입출금 세부 내역 메모 수정
bankbookRouter.post("/bankbook/transactionHistory/memo", async (req, res) => {
  const { mongodb } = await setup();
  const { _id, memo } = req.body;
  let objId = new ObjectId(_id);
  try {
    await mongodb
      .collection("transactions")
      .updateOne({ _id: objId }, { $set: { memo: memo } });
    res.status(200).send("Memo updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// DELETE: 입출금 세부 내역 메모 삭제
bankbookRouter.delete("/bankbook/transactionHistory/memo", async (req, res) => {
  const { mongodb } = await setup();
  const { _id } = req.body;

  try {
    await mongodb
      .collection("transactions")
      .updateOne({ _id: ObjectId(_id) }, { $unset: { memo: "" } });
    res.status(200).send("Memo deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

bankbookRouter.get("/bankbook/withdrawal", (req, res) => {
  res.render("withdrawal.ejs");
});
// CREATE: 이체
bankbookRouter.post("/bankbook/withdrawal", async (req, res) => {
  const { mongodb } = await setup();
  const { withdrawalAmount, title } = req.body;

  //   // 사용자 계좌 ID를 가져와야 합니다. 여기서는 예시로 사용자 계좌 ID를 "account_id"로 가정합니다.
  //   const account_id = "some_account_id"; // 실제로는 로그인한 사용자나 요청에서 가져와야 합니다.

  //   // 계좌의 현재 잔액을 가져오기 위해 먼저 계좌 정보를 조회합니다.
  //   const account = await mongodb
  //     .collection("accounts")
  //     .findOne({ _id: ObjectId(account_id) });

  //   if (!account) {
  //     return res.status(404).send("Account not found");
  //   }

  //   // 잔액 확인 후 출금 금액이 잔액보다 크면 출금 불가
  //   const balance_after = account.balance - parseInt(withdrawalAmount, 10);
  //   if (balance_after < 0) {
  //     return res.status(400).send("Insufficient funds");
  //   }

  // 이체 트랜잭션 데이터 생성
  const transaction = {
    // account_id: ObjectId(account_id),
    date: new Date(),
    title: title,
    type: "출금",
    amount: -parseInt(withdrawalAmount, 10), // 출금 금액은 음수로 저장
    // balance_after: balance_after,
  };

  // 이체 트랜잭션 데이터 삽입
  try {
    await mongodb.collection("transactions").insertOne(transaction);

    // // 계좌의 잔액 업데이트
    // await mongodb
    //   .collection("accounts")
    //   .updateOne(
    //     { _id: ObjectId(account_id) },
    //     { $set: { balance: balance_after } }
    //   );

    res.status(200).send("Withdrawal successful");
    res.render("bankbook.ejs", {
      data: { alertMsgWithdrawalSuccess: "이체에 성공하였습니다." },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = bankbookRouter;
