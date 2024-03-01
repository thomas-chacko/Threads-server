const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { use } = require("../routes/user.route");
const { default: mongoose } = require("mongoose");
const cloudinary = require("cloudinary").v2;

// signup api
const signup = async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    // if user already exists
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    // creating new user
    const newUser = new User({
      name,
      username,
      email,
      password: hashPassword,
    });
    await newUser.save();
    // return the data to client
    if (newUser) {
      // generate token
      generateToken(newUser._id, res);
      res.status(200).json({
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        profilePicture: newUser.profilePicture,
      });
    } else {
      res.status(400).json({ error: "Something went wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in signup api", error);
  }
};

// login api
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    const isMatch = await bcrypt.compare(
      password,
      existingUser?.password || ""
    );
    // if the user was not found
    if (!existingUser || !isMatch) {
      return res.status(400).json({ error: "Invalid user name or password" });
    }
    // generate token
    generateToken(existingUser._id, res);
    res.status(200).json({
      _id: existingUser._id,
      name: existingUser.name,
      username: existingUser.username,
      email: existingUser.email,
      bio: existingUser.bio,
      profilePicture: existingUser.profilePicture,
      followers: existingUser.followers,
      following: existingUser.following,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in login api", error);
  }
};

// logout api
const logout = async (req, res) => {
  try {
    res.clearCookie("jwt-token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in logout api", error);
  }
};

// get user profile api
const getProfile = async (req, res) => {
  const { query } = req.params;

  try {
    let user;
    // query is a userid
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query }).select("-password");
    } else {
      // query is a username
      user = await User.findOne({ username: query }).select("-password");
    }
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getUser API", error);
  }
};

// follow and unfollow api
const followUnfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user); // to get the current loged user
    // console.log(req.user); // user id
    if (!id || !currentUser) {
      return res.status(400).json({ error: "User not found" });
    }
    if (id === req.user) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      // un Follow
      await User.findByIdAndUpdate(req.user, { $pull: { following: id } }); // remove id from loged user folowing list
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user } }); // remove loged person's id from the person who already followed.
      res.status(200).json({ message: "un followed succesfully" });
    } else {
      // follow
      await User.findByIdAndUpdate(req.user, { $push: { following: id } }); // add id to loged user's following list
      await User.findByIdAndUpdate(id, { $push: { followers: req.user } });
      res.status(200).json({ message: "followed succesfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in follow api", error);
  }
};

// update user api
const updateUser = async (req, res) => {
  let { name, email, username, password, profilePicture, bio } = req.body;
  const userId = req.user;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    if (req.params.id !== userId.toString()) {
      return res
        .status(400)
        .json({ error: "you cannot update other users profile" });
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      user.password = hashPassword;
      await user.save();
    }
    if (profilePicture) {
      // to delete old image and store new image
      if (user.profilePicture) {
        await cloudinary.uploader.destroy(
          user.profilePicture.split("/").pop().split(".")[0]
        );
      }
      const uploadedImage = await cloudinary.uploader.upload(profilePicture);
      profilePicture = uploadedImage.secure_url;
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePicture = profilePicture || user.profilePicture;
    user.bio = bio || user.bio;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in update user api", error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const query = req.query.query.toLowerCase();
    // Fetch all users from the database
    const users = await User.find();
    // Filter users based on the query
    const filteredUsers = users.filter((user) =>
      user.username.toLowerCase().includes(query)
    );
    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in get all users api", error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getProfile,
  followUnfollow,
  updateUser,
  getAllUsers,
};
