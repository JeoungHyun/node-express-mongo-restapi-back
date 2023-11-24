const express = require("express");

const feedController = require("../controllers/feed");

const router = express.Router();

const isAuth = require("../middleware/is-auth");

// GET /feed/posts
router.get("/posts", isAuth, feedController.getPosts);

// POST /feed/posts
router.post("/posts", isAuth, feedController.createPost);

router.get("/posts/:postId", isAuth, feedController.getPost);

router.put("/posts/:postId", isAuth, feedController.updatePost);

router.delete("/posts/:postId", isAuth, feedController.deletePost);

module.exports = router;
