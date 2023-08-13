import express from "express";
import {
	createComment,
	createNewPost,
	deleteComment,
	deletePost,
	editComment,
	getAllPosts,
	getComments,
	getPostById,
	getVotes,
	getVoteStatus,
	updatePost,
	votePost,
} from "../controllers/PostController";

export const postRouter = express.Router();

// get all posts
postRouter.get("/posts/", getAllPosts);

// create a new post
postRouter.post("/posts", createNewPost);

// update a post
postRouter.patch("/post/:id", updatePost);

// delete a post
postRouter.delete("/post/:id", deletePost);

// get post by id
postRouter.get("/post/:id", getPostById);

// vote post
postRouter.put("/post/vote/:id", votePost);

// get votes
postRouter.get("/post/votes/:id", getVotes);

// get vote status
postRouter.get("/post/vote/:id", getVoteStatus);

// get all comments on post
postRouter.get("/post/comments/:id", getComments);

// comment on post
postRouter.post("/post/comment/:id", createComment);

// update comment
postRouter.patch("/post/comment/:id", editComment);

// delete comment
postRouter.delete("/post/comment/:id", deleteComment);

export default postRouter;
