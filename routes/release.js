var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 연결
let db = new sqlite3.Database('./db/modu.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

/* GET release page. */
router.get('/', function(req, res, next) {
    const logined = req.session ? req.session.logined : false;
    const user_id = req.session ? req.session.user_id : "";
    const getReleasesQuery = "select * from release order by release_idx desc";
    db.all(getReleasesQuery, (err, rows) => {
        if (err) return err;
        res.render('release', { hasBanner: true, logined, releases: rows, user: user_id });
    });
});

/* 발매정보 글쓰기 페이지 */
router.get('/write', function(req, res, next) {
    const logined = req.session ? req.session.logined : false;
    res.render('release_write', { hasBanner: false, logined });
});

/* 발매정보 상세보기 */
router.get('/:id', function(req, res, next) {
    const logined = req.session ? req.session.logined : false;
    const user_id = req.session ? req.session.user_id : "";
    const findQuery = `select * from release where release_idx=${req.params.id}`;
    db.get(findQuery, (err, row) => {
        if (err) return err;
        res.render('release_detail', { hasBanner: false, logined, detail: row, isMine: user_id === row.user_id });
    })
});

// 발매정보 추가
router.post('/create', function (req, res, next) {
    const { release_title, release_content } = req.body;
    const user_id = req.session.user_id;
    const reg_date = new Date().getFullYear()+'.'+(new Date().getMonth()+1)+'.'+new Date().getDate();
    const insertQuery = `insert into release(release_title, release_content, reg_date, user_id) values ('${release_title}', '${release_content}', '${reg_date}', '${user_id}')`;

    if (user_id) {
        db.serialize();
        db.each(insertQuery);

        const logined = req.session ? req.session.logined : false;
        const getReleasesQuery = "select * from release order by release_idx desc";
        db.all(getReleasesQuery, (err, rows) => {
            if (err) return err;
            res.render('release', { hasBanner: true, logined, releases: rows, user: user_id });
        });
    }
});

module.exports = router;
