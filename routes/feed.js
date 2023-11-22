const express = require("express");

const feedController = require("../controllers/feed");

const router = express.Router();

const isAuth = require("../middleware/is-auth");

// GET /feed/posts
router.get("/posts", isAuth, feedController.getPosts);

// POST /feed/posts
router.post("/posts", isAuth, feedController.createPost);

router.get("/posts/:postId", isAuth, feedController.getPost);

router.put("/posts/:postId", isAuth, feedController.updatePost); //일반적인 브라우져 양식으로는 보낼 수 없음,자바스크립트 비동기 요청으로 가능

router.delete("/posts/:postId", isAuth, feedController.deletePost);

module.exports = router;
