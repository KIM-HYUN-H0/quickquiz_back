const express = require("express");
const router = express.Router();

const db = require("../mariaConfig");

/* GET home page. */
router.get("/", function (req, res, next) {
  db.query("select * from test", function (err, rows, fields) {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
      res.json(err);
    }
  });
});

router.get("/test", function (req, res, next) {
  res.json('hi')
});

module.exports = router;
