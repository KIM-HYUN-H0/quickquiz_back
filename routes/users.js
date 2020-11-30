var express = require("express");
var router = express.Router();
var db = require("../mariaConfig");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require("bcrypt-nodejs");

/* GET users listing. */
router.get("/test", function (req, res, next) {
  res.json("hi");
});

passport.serializeUser(function (user, done) {
  done(null, user.userid);
});

passport.deserializeUser(function (id, done) {
  console.log('passport session get id: ', id);

  done(null, id);
});

passport.use(
  "login-local",
  new LocalStrategy(
    {
      usernameField: "userid",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, userid, password, done) => {
      db.query(
        "select * from user where userid=?",
        [userid],
        (err, rows) => {
          if (err) return done(err);
          if (rows.length) {
            bcrypt.compare(password, rows[0].password, (err, res) => {
              if (res) {
                return done(null, {
                  userid: rows[0].userid,
                });
              } else {
                return done(null, false, {
                  message: "Your Password is incorrect",
                });
              }
            });
          } else {
            return done(null, false, { message: "로그인 오류" });
          }
        })
    }
  )
);

router.post("/login", (req, res, next) => {
  console.log('login local');
  passport.authenticate("login-local", (err, user, info) => {
    console.log(user);
    if (err) {
      res.status(500).json(err);
    }
    if (!user) {
      return res.status(401).json(info.message);
    }
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.json(err)
      }

      return res.json(user);
    });
  })(req, res, next)
});

router.get('/signup', (req, res, next) => {
  console.log('dd');
  res.json('됨')
})


passport.use(
  "join-local",
  new LocalStrategy(
    {
      usernameField: "userid",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, userid, password, done) => {
      db.query('select * from user where userid=?', [userid], (err, rows) => {
        console.log('d')
        if(err) { return done(err); }
        if(rows.length) {
          return done(null, false, {message : '이메일 중복'});
        }
        else {
          bcrypt.hash(password, null, null, (err,hash) => {
            var sql = {userid : userid, password : hash };
            db.query('insert into user set ?', sql, (err, rows) => {
              if(err) throw err;
              return done(null, {'userid' : userid, 'username' : rows.username})
            })
          })
        }
      })
    }
  )
);

router.post(
  "/signup",
  passport.authenticate("join-local"), (req, res) => {
    res.json('회원가입 성공')
  }
);

module.exports = router;
