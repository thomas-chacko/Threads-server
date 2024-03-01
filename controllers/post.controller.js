const User = require("../models/user.model");
const Post = require("../models/post.model");
const cloudinary = require("cloudinary").v2;

// create a new post api
const createPost = async (req, res) => {
  let { postedBy, text, image } = req.body;
  try {
    if (!postedBy || !text) {
      return res.status(400).json({ error: "please fill the fileds" });
    }
    const user = await User.findById(postedBy);

    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    if (postedBy !== req.user) {
      return res.status(400).json({ error: "you cant create !" });
    }
    const maxLength = 500;
    if (text.lenght > maxLength) {
      return res
        .status(400)
        .json({ error: `text must be less than ${maxLength}` });
    }
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image);
      image = uploadedImage.secure_url;
    }
    const newPost = new Post({
      postedBy,
      text,
      image,
    });
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in create post api");
  }
};

// get a post api
const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) {
      res.status(400).json({ error: "post not found !" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in create getpost api");
  }
};

// delete post api
const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }
    if (post.postedBy.toString() !== req.user) {
      res.status(400).json({ error: "you cannot delete this post" });
    }
    if (post.image) {
      const imageId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "post deleted succesfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in delete post api");
  }
};

// like and unlike the post api
const LikeUnlikePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }
    const userLiked = post.likes.includes(userId);
    if (userLiked) {
      // Unlike
      await Post.updateOne({ _id: id }, { $pull: { likes: userId } });
      res.status(200).json({ message: "unliked successfully" });
    } else {
      // Like
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "post liked successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in like and unlike post api");
  }
};

// replay to a post api
const replayPost = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user; // user id
  const user = await User.findById(userId); // to get the loged user object
  const userProfilePicture = user.profilePicture;
  const username = user.username;
  try {
    if (!text) {
      return res.status(400).json({ error: "text field is required" });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(400).json({ error: "post not found" });
    }
    const replay = { userId, text, userProfilePicture, username };
    post.replies.push(replay);
    await post.save();
    res.status(200).json({ message: "replyed succesfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in replay post api");
  }
};

// feed post api
const feedPost = async (req, res) => {
  const userId = req.user;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const following = user.following;
    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });
    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in feed post api:", error);
  }
};

const getUserPost = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ error: "user not found" });
    }
    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

module.exports = {
  createPost,
  getPost,
  deletePost,
  LikeUnlikePost,
  replayPost,
  feedPost,
  getUserPost,
};
