import express from "express";
import {
	createNewPost,
	deletePost,
	getAllPosts,
	updatePost,
} from "../controllers/PostController";

export const postRouter = express.Router();

// get all posts
postRouter.get("/posts", getAllPosts);

// create a new post
postRouter.post("/posts", createNewPost);

// update a post
postRouter.post("/posts/:id", updatePost);

// delete a post
postRouter.post("/posts/:id", deletePost);

export default postRouter;
