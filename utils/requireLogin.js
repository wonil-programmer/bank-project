// 세션 확인 미들웨어 정의
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/");
  } else {
    next();
  }
};

module.exports = requireLogin;
