
const fnemail = (req, res, next) => {
    const emailtest = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;  // 이메일 형식 
    if (!emailtest.test(req.body.useremail)) {       // useremail을 usertest와 비교해서 만약 다르면                  
        return res.render('enter.ejs', { data: { alertMsg: '유효한 이메일을 입력해주세요' } });    // enter.ejs로 이동하고 msg전송
    }      
    next();
}

module.exports = fnemail;

// const fnemail = require('./e_check'); // 불러오고
// router.post('/account/save', fnemail, async (req, res) => {  // post에서 사용