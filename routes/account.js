const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");

// GET: 회원가입 페이지 요청
router.get("/account/signup", (req, res) => {
  res.render("signup.ejs");
});

// POST: id 중복 확인
router.post("/account/check-id", async (req, res) => {
  const { mongodb } = await setup();
  mongodb
    .collection("account")
    .findOne({ userid: req.body.userid })
    .then((result) => {
      if (result) {
        res.json({ isDuplicate: true });
      } else {
        res.json({ isDuplicate: false });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// POST: 회원가입 요청
router.post("/account/save", async (req, res) => {
  const { mongodb, mysqldb } = await setup();
  const generateSalt = (length = 16) => {
    const crypto = require("crypto");
    return crypto.randomBytes(length).toString("hex");
  };

  const salt = generateSalt();
  req.body.userpw = sha(req.body.userpw + salt);
  mongodb
    .collection("account")
    .insertOne(req.body)
    .then((result) => {
      if (result) {
        const sql = `insert into usersalt (userid, salt) 
                values (?, ?)`;
        mysqldb.query(sql, [req.body.userid, salt], (err, rows, fields) => {
          if (err) {
            console.log(err);
          } else {
            console.log("salt 저장 성공");
          }
        });
        res.redirect("/");
      } else {
        res.render("signup.ejs", { data: { alertMsg: "회원 가입 실패" } });
      }
    })
    .catch((err) => {
      res.render("signup.ejs", { data: { alertMsg: "회원 가입 실패" } });
    });
});

// POST: 로그인
function renderLoginRetry(res) {
  return res.render("index.ejs", {
    data: { alertMsg: "다시 로그인해주세요" },
  });
}
router.post("/account/login", async (req, res) => {
  const { mongodb, mysqldb } = await setup();
  mongodb
    .collection("account")
    .findOne({ userid: req.body.userid })
    .then((result) => {
      if (result) {
        const sql = `select salt from usersalt where userid = ?`;
        mysqldb.query(sql, [result.userid], (err, rows, fields) => {
          const salt = rows[0].salt;
          const hashPw = sha(req.body.userpw + salt);
          if (result.userpw == hashPw) {
            // login ok
            // 세션 부여: 세션에는 해쉬된 비밀번호를 넣어야 함
            req.body.userpw = hashPw;
            req.session.user = req.body;
            console.log("req.session: ", req.session);
            // 브라우저 쿠키에 저장
            res.cookie("uid", req.body.userid);
            res.render("index.ejs");
          } else {
            // pw fail
            renderLoginRetry(res);
          }
        });
      } else {
        renderLoginRetry(res);
      }
    })
    .catch((err) => {
      renderLoginRetry(res);
    });
});

// GET: 로그아웃
router.get("/account/logout", (req, res) => {
  req.session.destroy();
  res.render("index.ejs");
});

module.exports = router;
