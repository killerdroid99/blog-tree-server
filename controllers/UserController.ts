import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../types/UserTypes";
import { prisma } from "../index";

export const createNewUser = async (req: Request, res: Response) => {
	try {
		const hashedPassword: string = await bcrypt.hash(req.body.password, 10);
		const newuser: User = await prisma.user.create({
			data: {
				name: req.body.name,
				password: hashedPassword,
				email: req.body.email,
			},
		});
		// store user id session
		// this will set a cookie on the user
		// keep them logged in
		req.session.userId = newuser.id;

		res.json({
			msg: `user:${req.body.name} added successfully`,
		});
	} catch (error) {
		res.status(400).json({ msg: "there was some error", error });
	}
};

export const authenticateUser = async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findFirst({
			where: {
				email: req.body.email,
			},
		});
		if (user) {
			const passwordMatched: boolean = await bcrypt.compare(
				req.body.password,
				user.password
			);
			if (passwordMatched) {
				req.session.userId = user.id;
				// console.log(req.session);
				res.json({
					msg: `user:${user.name} authenticated`,
				});
			} else {
				res.status(403).json({
					msg: `you entered invalid credentials`,
				});
			}
		} else {
			res.status(404).json({
				msg: `no user found with email: ${req.body.email}`,
			});
		}
	} catch (error) {
		res.status(400).json({ msg: "there was some error", error });
	}
};

export const logOutUser = async (req: Request, res: Response) => {
	try {
		req.session.destroy((err) => {
			// console.log(err);
		});
		res.clearCookie("qid");
		res.sendStatus(204);
	} catch (error) {
		res.status(400).json({ msg: "there was some error", error });
	}
};

export const getUser = async (req: Request, res: Response) => {
	try {
		const userData = await prisma.user.findUnique({
			where: {
				id: req.params.id,
			},
			select: {
				name: true,
				email: true,
			},
		});

		res.json(userData);
	} catch (error) {
		res.status(400).json({ msg: "there was some error", error });
	}
};
