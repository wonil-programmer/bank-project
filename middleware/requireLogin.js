// 세션 확인 미들웨어 정의
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    res.render("index.ejs", { data: { deniedAccess: true } });
  } else {
    next();
  }
};

module.exports = requireLogin;
