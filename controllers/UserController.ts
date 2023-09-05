import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../types/UserTypes";
import { prisma, redis } from "../index";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

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
			profileImage: true,
		},
	});

	res.json(userData);
	return;
};

// TODO: configure forgot password
export const forgotPassword = async (req: Request, res: Response) => {
	try {
		if (!req.body?.email) {
			return res.json({
				success: false,
				msg: `Email cannot be blank`,
				fields: ["email"],
			});
		}

		const user = await prisma.user.findUnique({
			where: {
				email: req.body?.email,
			},
		});

		if (!user) {
			return res.json({
				success: false,
				msg: `User with email ${req.body?.email} doesn't exist`,
				fields: ["email"],
			});
		}

		const token = v4();

		await redis.set(`forgot-password-${token}`, user.id, "EX", 1000 * 60 * 5); // 5 minutes

		sendEmail(
			user.email,
			`<h1>Hello ${user.name}</h1>
		<p>Visit <a href='${process.env.CLIENT_URL}/reset-password/${token}'>this link</a> to reset your password</p>
		`
		);

		return res.json({ success: true, msg: "Verification email sent" });
	} catch (error) {}
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
				profileImage: true,
			},
		});

		res.json(userData);
	} catch (error) {
		res.status(400).json({ msg: "there was some error", error });
	}
};

interface IProfileName extends Request {
	body: {
		name: string;
	};
}

export const userProfileName = async (req: IProfileName, res: Response) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.session.userId,
			},
		});

		if (!user) {
			return res.json({
				success: false,
				msg: `User not authenticated`,
			});
		}

		if (!req.body.name) {
			return res.json({
				success: false,
				msg: `Name cannot be empty`,
				fields: ["name"],
			});
		}

		if (req.body.name === user.name) {
			return res.json({
				success: false,
				msg: `Name is not changed`,
				fields: ["name"],
			});
		}
		await prisma.user.update({
			where: {
				id: req.session.userId,
			},
			data: {
				name: req.body.name,
			},
		});
		return res.json({ success: true, msg: "Name updated" });
	} catch (error) {
		res
			.status(400)
			.json({ success: false, msg: `There was some error: ${error}` });
	}
};

interface IProfileEmail extends Request {
	body: {
		email: string;
		confirmPassword: string;
	};
}

export const userProfileEmail = async (req: IProfileEmail, res: Response) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.session.userId,
			},
		});

		if (!user) {
			return res.json({
				success: false,
				msg: `User not authenticated`,
			});
		}

		if (!req.body.email) {
			return res.json({
				success: false,
				msg: `Email cannot be empty`,
				fields: ["email"],
			});
		}

		const passwordMatched: boolean = await bcrypt.compare(
			req.body.confirmPassword,
			user.password
		);

		if (!passwordMatched) {
			return res.json({
				success: false,
				msg: "Password entered is incorrect",
				fields: ["confirmPassword"],
			});
		}

		await prisma.user.update({
			where: {
				id: req.session.userId,
			},
			data: {
				email: req.body.email,
			},
		});
		return res.json({ success: true, msg: "Email updated" });
	} catch (error) {
		res
			.status(400)
			.json({ success: false, msg: `there was some error: ${error}` });
	}
};

interface IProfilePassword extends Request {
	body: {
		prevPassword: string;
		newPassword: string;
		confirmNewPassword: string;
	};
}

export const userPasswordChange = async (
	req: IProfilePassword,
	res: Response
) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.session.userId,
			},
		});

		if (!user) {
			return res.json({
				success: false,
				msg: `User not authenticated`,
			});
		}

		if (
			req.body.prevPassword &&
			req.body.newPassword &&
			req.body.confirmNewPassword
		) {
			const passwordMatched: boolean = await bcrypt.compare(
				req.body.prevPassword,
				user.password
			);

			if (!passwordMatched) {
				return res.json({
					success: false,
					msg: "Current password entered is incorrect",
					fields: ["prevPassword"],
				});
			}

			if (req.body.newPassword !== req.body.confirmNewPassword) {
				return res.json({
					success: false,
					msg: "Passwords don't match",
					fields: ["newPassword", "confirmNewPassword"],
				});
			}

			await prisma.user.update({
				where: {
					id: req.session.userId,
				},
				data: {
					password: req.body.newPassword,
				},
			});

			return res.json({
				success: true,
				msg: `password changed`,
			});
		}
	} catch (error) {
		res
			.status(400)
			.json({ success: false, msg: `there was some error: ${error}` });
	}
};

export const userProfilePicture = async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.session.userId,
			},
		});

		if (!user) {
			return res.json({
				success: false,
				msg: `User not authenticated`,
			});
		}

		if (!req.file?.destination) {
			return res.json({
				success: false,
				msg: `Enter a valid image file`,
				fields: ["image"],
			});
		}

		await prisma.user.update({
			where: {
				id: req.session.userId,
			},
			data: {
				profileImage:
					"http://localhost:8080/" +
					req.file.destination.replace("./public", "") +
					"/" +
					req.file.filename,
			},
		});
		return res.json({ success: true, msg: "Profile picture updated" });
	} catch (error) {
		res
			.status(400)
			.json({ success: false, msg: `there was some error: ${error}` });
	}
};
