const express = require("express");
const router = express.Router();
const userControler = require("../controllers/user.controller");
const verifyToken = require("../middlewares/verifyToken");

// signup route
router.post("/api/user/signup", userControler.signup);

// login route
router.post("/api/user/login", userControler.login);

// logout route
router.post("/api/user/logout", userControler.logout);

// get user profile route
router.get("/api/user/profile/:query", userControler.getProfile);

// follow and unfollow route
router.post("/api/user/follow/:id", verifyToken, userControler.followUnfollow);

// update user route
router.put("/api/user/update/:id", verifyToken, userControler.updateUser);

// get all users
router.get("/api/user/search", userControler.getAllUsers);

module.exports = router;
