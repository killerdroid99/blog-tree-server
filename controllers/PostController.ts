import { Request, Response } from "express";
import { prisma } from "../index";

export const getAllPosts = async (req: Request, res: Response) => {
	try {
		const posts = await prisma.post.findMany();

		res.json(posts);
	} catch (error) {
		res.status(400).json({ msg: "Request cannot be processed" });
	}
};

export const createNewPost = async (req: Request, res: Response) => {
	if (req.session.userId) {
		try {
			const newPost = await prisma.post.create({
				data: {
					...req.body,
					authorId: req.session.userId,
				},
			});

			res.json({ msg: "post added successfully", newPost });
		} catch (error) {
			res.status(400).json({ msg: "Request cannot be processed" });
		}
	} else {
		res.status(403).json({ msg: "User not authenticated" });
	}
};

export const updatePost = async (req: Request, res: Response) => {
	if (req.session.userId) {
		try {
			const post = await prisma.post.update({
				where: {
					id: req.params.id,
				},
				data: {
					...req.body,
					authorId: req.session.userId,
				},
			});

			res.json({ msg: "post updated successfully", post });
		} catch (error) {
			res.status(400).json({ msg: "Request cannot be processed" });
		}
	} else {
		res.status(403).json({ msg: "User not authenticated" });
	}
};

export const deletePost = async (req: Request, res: Response) => {
	if (req.session.userId) {
		try {
			const post = await prisma.post.delete({
				where: {
					id: req.params.id,
				},
			});

			res.json({ msg: "post deleted successfully", post });
		} catch (error) {
			res.status(400).json({ msg: "Request cannot be processed" });
		}
	} else {
		res.status(403).json({ msg: "User not authenticated" });
	}
};
