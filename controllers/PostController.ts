import { Request, Response } from "express";
import { prisma } from "../index";

export const getAllPosts = async (req: Request, res: Response) => {
	try {
		// const Limit = parseInt(req.query.limit as string);
		// const Cursor = req.query.limit as string;
		// console.log(Cursor);

		// let posts = await prisma.post.findMany({
		// 	orderBy: {
		// 		createdAt: "desc",
		// 	},
		// 	select: {
		// 		id: true,
		// 		title: true,
		// 		createdAt: true,
		// 		updated: true,
		// 		author: {
		// 			select: {
		// 				name: true,
		// 			},
		// 		},
		// 	},
		// 	take: req.query.limit ? Math.min(Limit, 15) : 15,
		// 	skip: req.query.cursor ? 1 : 0,
		// 	cursor: {
		// 		id: req.query.limit as string,
		// 	},
		// });

		// const nextId =
		// 	posts.length === Limit ? posts[Limit - 1].id : posts[posts.length - 1].id;

		// res.json({ posts, nextId });

		const allPosts = await prisma.post.findMany({
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				title: true,
				createdAt: true,
				updated: true,
				author: {
					select: {
						name: true,
					},
				},
			},
			// take: 2,
		});

		res.json(allPosts);
	} catch (error) {
		console.log(error);
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
			const postVotes = await prisma.votes.deleteMany({
				where: {
					postId: req.params.id,
				},
			});

			const post = await prisma.post.delete({
				where: {
					id: req.params.id,
				},
			});

			res.json({ msg: "post deleted successfully", post });
		} catch (error) {
			console.log(error);
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
					res.json({ msg: "vote removed" });
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
					voterId: req.session.userId!,
				},
			},
		});

		res.json(voteStatus);
	} catch (error) {
		res.status(400).json({ msg: "Request cannot be processed" });
	}
};

export const getComments = async (req: Request, res: Response) => {
	try {
		const allComments = await prisma.comment.findMany({
			where: {
				postId: req.params.id,
			},
			include: {
				commenter: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		res.json(allComments);
	} catch (error) {
		res.status(400).json({ msg: "Request cannot be processed" });
	}
};

export const createComment = async (req: Request, res: Response) => {
	if (req.session.userId) {
		try {
			const newComment = await prisma.comment.create({
				data: {
					text: req.body.text,
					commenterId: req.session.userId!,
					postId: req.params.id,
				},
			});

			res.json({ msg: "comment added successfully", newComment });
		} catch (error) {
			console.log(error);
			res.status(400).json({ msg: "Request cannot be processed" });
		}
	} else {
		res.status(403).json({ msg: "User not authenticated" });
	}
};

export const deleteComment = async (req: Request, res: Response) => {
	if (req.session.userId) {
		try {
			const comment = await prisma.comment.delete({
				where: {
					id: req.params.id,
				},
			});

			res.json({ msg: "comment deleted successfully", comment });
		} catch (error) {
			res.status(400).json({ msg: "Request cannot be processed" });
		}
	} else {
		res.status(403).json({ msg: "User not authenticated" });
	}
};

export const editComment = async (req: Request, res: Response) => {
	if (req.session.userId) {
		try {
			const comment = await prisma.comment.update({
				where: {
					id: req.params.id,
				},
				data: {
					text: req.body.text,
				},
			});

			res.json({ msg: "comment edited successfully", comment });
		} catch (error) {
			res.status(400).json({ msg: "Request cannot be processed" });
		}
	} else {
		res.status(403).json({ msg: "User not authenticated" });
	}
};
