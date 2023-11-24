const Post = require("../model/post");
const User = require("../model/user");
const fs = require("fs");
const path = require("path");
const io = require("../socket");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1; //없으면 1 저장
  console.log("currentPage:", currentPage);

  const perPage = 2; //몇 개씩 보여 줄지
  let totalItems;
  Post.find()
    .populate("creator")
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res
        .status(200)
        .json({ message: "success", posts: posts, totalItems: totalItems });
    })
    .catch((err) => {
      console.log(err);
    });
  // res.status(200).json({
  //   posts: [
  //     {
  //       _id: "1",
  //       title: "First Post",
  //       content: "This is the first post!",
  //       imageUrl: "images/duck.jpg",
  //       creator: {
  //         name: "Maximilian",
  //       },
  //       createdAt: new Date(),
  //     },
  //   ],
  // });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");
  let creator;
  const post = new Post({
    title: title,
    content: content,
    creator: req.userId,
    imageUrl: imageUrl,
  });
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      io.getIO().emit("posts", {
        action: "create",
        post: {
          ...post._doc,
          creator: {
            _id: req.userId,
            name: result.name,
          },
        },
      }); //소켓 연결 된 곳에 데이터 발산
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      console.log("post", post);
      if (!post) {
        const error = new Error("Not Find");
        throw error;
      }
      res.status(200).json({ message: "Post Finish", post: post });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  //  const imageUrl = req.file.path.replace("\\", "/");
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl || !req.file.path) {
    const error = new Error("no File");
    error.statusCode = 422;
    throw error;
  }
  imageUrl = req.file.path.replace("\\", "/");
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("DB에서 게시물을 찾을 수 없음");
        error.statusCode = 404;
        throw error;
      }
      //로그인한 사람이랑 맞는지 확인 해야 됨
      if (post.creator.toString() !== req.userId) {
        const error = new Error("사용자 일치하지 않음");
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        let orgingImageUrl = post.imageUrl;
        post.imageUrl.replace("\\", "/");
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "post update", post: result });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }
      //로그인한 사람이랑 맞는지 확인 해야 됨
      if (post.creator.toString() !== req.userId) {
        const error = new Error("사용자 일치하지 않음");
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl); //이미지파일 삭제
      return Post.findOneAndDelete(postId); //mongo에서 게시물 삭제
    })
    .then((result) => {
      console.log(result);
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId); //유저에 저장되어있는 postId 삭제 [관계 제거]
      return user.save();
    })
    .then((user) => {
      res.status(200).json({ message: "delete success" });
    })
    .catch((err) => {
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "../", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
