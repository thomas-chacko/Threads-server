const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const verifyToken = require("../middlewares/verifyToken");

// to get a post
router.get("/api/post/:id", postController.getPost);

router.get("/api/userpost/:username", postController.getUserPost);

// to get the feed post
router.get("/api/feedpost", verifyToken, postController.feedPost);

// create post route
router.post("/api/post/create", verifyToken, postController.createPost);

// delete a post
router.delete("/api/post/:id", verifyToken, postController.deletePost);

// like a post
router.put("/api/post/like/:id", verifyToken, postController.LikeUnlikePost);

// replay to post
router.put("/api/post/reply/:id", verifyToken, postController.replayPost);

module.exports = router;
