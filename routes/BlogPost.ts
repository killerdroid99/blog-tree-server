import express from "express";
import {
	createNewPost,
	deletePost,
	getAllPosts,
	getPostById,
	updatePost,
} from "../controllers/PostController";

export const postRouter = express.Router();

// get all posts
postRouter.get("/posts", getAllPosts);

// create a new post
postRouter.post("/posts", createNewPost);

// update a post
postRouter.patch("/posts/:id", updatePost);

// delete a post
postRouter.delete("/posts/:id", deletePost);

// get post by id
postRouter.get("/posts/:id", getPostById);

export default postRouter;
