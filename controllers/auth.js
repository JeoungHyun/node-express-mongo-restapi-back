const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../model/user");

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "사용자 생성", userId: result.id });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("사용자를 찾을 수 없습니다.");
        error.statusCode = 401;
        throw error;
      }
      loadUser = user;
      return bcrypt.compare(password, user.password); // 암호화 된 값과 비교해서 맞으면
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("패스워드가 틀립니다.");
        error.statusCode = 401;
        throw error;
      }
      //JSON 웹 토큰 (JWT 생성 부분!)
      const token = jwt.sign(
        {
          email: loadUser.email,
          userId: loadUser._id.toString(),
        },
        "tokenkey",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadUser._id.toString() }); //userId 보내줘야되 저장 단계는 프론트에서 완성 됨
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
