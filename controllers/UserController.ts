import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../types/UserTypes";
import { prisma } from "../index";

interface ICreateNewUser extends Request {
	body: {
		name: string;
		email: string;
		password: string;
		confirmPassword: string;
		loginDirectly: boolean;
	};
}

export const createNewUser = async (req: ICreateNewUser, res: Response) => {
	try {
		if (!req.body.name) {
			return res.json({
				success: false,
				msg: `Name cannot be empty`,
				fields: ["name"],
			});
		} else if (!req.body.email) {
			return res.json({
				success: false,
				msg: "Email cannot be empty",
				fields: ["email"],
			});
		} else if (req.body.password.length < 8) {
			return res.json({
				success: false,
				msg: "Password must be at least 8 characters long",
				fields: ["password"],
			});
		} else if (req.body.password !== req.body.confirmPassword) {
			return res.json({
				success: false,
				msg: "Passwords don't match",
				fields: ["password", "confirmPassword"],
			});
		}

		const emailAlreadyExists = await prisma.user.findUnique({
			where: {
				email: req.body.email,
			},
		});

		if (emailAlreadyExists?.id) {
			return res.json({
				success: false,
				msg: "User with this email already exists",
				fields: ["email"],
			});
		}

		const hashedPassword: string = await bcrypt.hash(req.body.password, 10);
		const newUser: User = await prisma.user.create({
			data: {
				name: req.body.name,
				password: hashedPassword,
				email: req.body.email,
			},
		});
		// store user id session
		// this will set a cookie on the user
		// keep them logged in

		if (req.body.loginDirectly) {
			req.session.userId = newUser.id;
		}

		return res.json({
			success: true,
			msg: `User:${req.body.name} added successfully`,
		});
	} catch (error) {
		return res.status(400).json({ msg: "There was some error", error });
	}
};

export const authenticateUser = async (req: Request, res: Response) => {
	try {
		if (!req.body.email) {
			return res.json({
				success: false,
				msg: "Email cannot be empty",
				fields: ["email"],
			});
		}
		if (!req.body.password) {
			return res.json({
				success: false,
				msg: "Password cannot be empty",
				fields: ["password"],
			});
		}

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
				return res.json({
					success: true,
					msg: `User:${user.name} authenticated`,
				});
			} else {
				return res.json({
					success: false,
					msg: `You entered wrong password`,
					fields: ["password"],
				});
			}
		} else {
			return res.json({
				success: false,
				msg: `No user found with email: ${req.body.email}`,
				fields: ["email"],
			});
		}
	} catch (error) {
		res.status(400).json({ msg: "There was some error", error });
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

export const currentUser = async (req: Request, res: Response) => {
	if (!req.session.userId) {
		res.json({ msg: "user not logged in" });
		return;
	}

	const userData = await prisma.user.findUnique({
		where: {
			id: req.session.userId,
		},
		select: {
			id: true,
			name: true,
			email: true,
		},
	});

	res.json(userData);
	return;
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
