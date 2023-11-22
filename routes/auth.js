const express = require("express");
const { check, body } = require("express-validator"); // 유효성 검사

const User = require("../model/user");
const authController = require('../controllers/auth')

const router = express.Router();

router.put("/signup", [
  check("email")
    .isEmail()
    .withMessage("이메일을 확인해주세요")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("이메일이 이미 존재합니다.");
        }
      });
    })
    .normalizeEmail(),
  check("password").trim().isLength({ min: 5 }),
  check('name').trim().not().isEmpty()
],authController.signUp);

router.post('/login',authController.login);

module.exports = router;
