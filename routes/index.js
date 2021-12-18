var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 연결
let db = new sqlite3.Database('./db/modu.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
    const logined = req.session ? req.session.logined : false;
    const getReleasesQuery = "select * from release order by release_idx desc limit 4";
    db.all(getReleasesQuery, (err, rows) => {
        if (err) return err;
        res.render('index', { hasBanner: true, logined, releases: rows });
    });
});

module.exports = router;
