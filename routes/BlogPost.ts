import express from "express";
import {
	createNewPost,
	deletePost,
	getAllPosts,
	getPostById,
	getVotes,
	getVoteStatus,
	updatePost,
	votePost,
} from "../controllers/PostController";

export const postRouter = express.Router();

// get all posts
postRouter.get("/posts", getAllPosts);

// create a new post
postRouter.post("/posts", createNewPost);

// update a post
postRouter.patch("/post/:id", updatePost);

// delete a post
postRouter.delete("/post/:id", deletePost);

// get post by id
postRouter.get("/posts/:id", getPostById);

// vote post
postRouter.put("/posts/votes/:id", votePost);

// get votes
postRouter.get("/posts/votes/:id", getVotes);

// get vote status
postRouter.get("/posts/vote/:id", getVoteStatus);

export default postRouter;
