var express = require("express");
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 연결
let db = new sqlite3.Database('./db/modu.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

// 회원가입 입성!!!
router.get("/signin", function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    res.render('signin', { hasBanner: false, logined, validation: "" });
});

// 회원가입!!!!!
router.post('/signin', function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    const { user_name, user_email, user_id, user_password, user_password_check, user_nickname } = req.body;
    const insertQuery = `insert into user(user_name, user_email,user_nickname, user_id, user_password) values ('${user_name}', '${user_email}','${user_nickname}', '${user_id}', '${user_password}')`;

    if (user_password !== user_password_check) {
        res.render('signin', { hasBanner: false, logined, validation: "pw" });
    } else {
        db.run(insertQuery, err => {
            if (err) return console.error(err.message);
            res.render("login", { hasBanner: false, logined: req.session.logined });
        });
    }
});

// 로그인 페이지 입성!
router.get("/login", function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    res.render("login", { hasBanner: false, logined });
});

// 로그인!!!
router.post('/login',function (req, res, next){
    const logined = req.session ? req.session.logined : false;
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    const query = `SELECT * FROM user WHERE user_id == '${id}'`
    db.serialize();
    db.each(query);
    db.get(query, [], (err, row) => {
        if (err) {
            throw err;
        } else if (row === undefined){
            console.log("아이디 없음")
            res.render("login", { hasBanner: false, logined });
        } else if(pw == row.user_password){
            console.log('로그인 성공')
            req.session.logined = true;
            req.session.nickname = row.user_nickname;
            req.session.user_id = id;
            req.session.pw = pw;

            const getReleasesQuery = "select * from release order by release_idx desc limit 4";
            db.all(getReleasesQuery, (err, rows) => {
                if (err) return err;
                res.render('index', { hasBanner: true, logined: req.session.logined, releases: rows });
            });
        } else {
            console.log(row);
            console.log('로그인 실패');
            res.render("login", { hasBanner: false, logined });
        }
    });
});

// 로그아웃!!!
router.get('/logout', function (req, res, next) {
    req.session.destroy(function(err){
        res.redirect('/');
    });
});



module.exports = router;