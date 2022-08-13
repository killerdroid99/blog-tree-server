import { Request, Response } from "express";
import { prisma } from "../index";

export const getAllPosts = async (req: Request, res: Response) => {
	try {
		const posts = await prisma.post.findMany({
			orderBy: {
				createdAt: "desc",
			},
			include: {
				author: {
					select: {
						name: true,
					},
				},
			},
			take: 15,
		});

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
			const findPost = await prisma.post.findFirst({
				where: {
					id: req.params.id,
				},
			});

			if (findPost?.authorId === req.session.userId) {
				const post = await prisma.post.update({
					where: {
						id: req.params.id,
					},
					data: {
						...req.body,
						updated: true,
					},
				});

				res.json({ msg: "post updated successfully", post });
			} else {
				res.status(403).json({ msg: "This is not your post!" });
			}
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

export const getPostById = async (req: Request, res: Response) => {
	try {
		const post = await prisma.post.findUnique({
			where: {
				id: req.params.id,
			},
			include: {
				author: {
					select: {
						name: true,
					},
				},
			},
		});

		res.json(post);
	} catch (error) {
		res.status(400).json({ msg: "Request cannot be processed" });
	}
};

export const votePost = async (req: Request, res: Response) => {
	if (req.session.userId) {
		try {
			const votePost = await prisma.votes.findUnique({
				where: {
					postId_voterId: {
						postId: req.params.id,
						voterId: req.session.userId,
					},
				},
			});

			if (votePost) {
				if (!votePost.voted) {
					await prisma.votes.update({
						where: {
							postId_voterId: {
								postId: req.params.id,
								voterId: req.session.userId,
							},
						},
						data: {
							voteCount: {
								increment: 1,
							},
							voted: {
								set: true,
							},
						},
					});
					res.json({ msg: "voted" });
				} else if (votePost.voted) {
					await prisma.votes.update({
						where: {
							postId_voterId: {
								postId: req.params.id,
								voterId: req.session.userId,
							},
						},
						data: {
							voteCount: {
								decrement: 1,
							},
							voted: {
								set: false,
							},
						},
					});
					res.json({ msg: "unvoted" });
				}
			} else {
				await prisma.votes.create({
					data: {
						postId: req.params.id,
						voterId: req.session.userId,
						voteCount: 1,
						voted: true,
					},
				});
				res.json({ msg: "created and voted" });
			}
		} catch (error) {
			res.status(400).json({ msg: "Request cannot be processed" });
		}
	} else {
		res.status(403).json({ msg: "User not authenticated" });
	}
};

export const getVotes = async (req: Request, res: Response) => {
	try {
		const allVotes = await prisma.votes.count({
			where: {
				postId: req.params.id,
				voted: true,
			},
		});

		res.json({ totalVotes: allVotes });
	} catch (error) {
		res.status(400).json({ msg: "Request cannot be processed" });
	}
};

export const getVoteStatus = async (req: Request, res: Response) => {
	try {
		const voteStatus = await prisma.votes.findUnique({
			where: {
				postId_voterId: {
					postId: req.params.id,
					// @ts-ignore
					voterId: req.session.userId,
				},
			},
		});
		console.log(req.session.userId, voteStatus);

		res.json(voteStatus);
	} catch (error) {
		res.status(400).json({ msg: "Request cannot be processed" });
	}
};
