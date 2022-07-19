import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

async function main() {
	app.get("/", (req, res) => {
		res.json({ msg: "hello world" });
	});

	// get all users
	app.get("/users", async (req, res) => {
		try {
			const users: object[] = await prisma.user.findMany();
			res.json({
				msg: "got all users",
				data: users,
			});
		} catch (error) {
			res.status(400).json({ msg: "there was some error", error });
		}
	});

	// create a new user
	app.post("/auth/signup", async (req, res) => {
		try {
			const hashedPassword: string = await bcrypt.hash(req.body.password, 10);
			const newuser: object = await prisma.user.create({
				data: {
					name: req.body.name,
					password: hashedPassword,
					email: req.body.email,
				},
			});
			res.json({
				msg: `user:${req.body.name} added successfully`,
			});
		} catch (error) {
			res.status(400).json({ msg: "there was some error", error });
		}
	});

	// authenticate the user
	app.post("/auth/login", async (req, res) => {
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
	});

	// update an existing user
	app.patch("/auth/update/:id", async (req, res) => {
		try {
			const updateduser: object = await prisma.user.update({
				where: { id: req.params.id },
				data: { ...req.body },
			});
			res.json({
				msg: "user updated successfully",
				data: updateduser,
			});
		} catch (error) {
			res.status(400).json({ msg: "there was some error", error });
		}
	});

	// deletes a user
	app.delete("/auth/delete/:id", async (req, res) => {
		try {
			const deleteduser: object = await prisma.user.delete({
				where: { id: req.params.id },
			});
			res.json({
				msg: "user deleted successfully",
				data: deleteduser,
			});
		} catch (error) {
			res.status(400).json({ msg: "there was some error", error });
		}
	});

	app.listen(process.env.PORT || 4000, () =>
		console.log(`listening on http://localhost:${process.env.PORT || 4000}`)
	);
}

main()
	.catch((e) => {
		throw e;
	})

	.finally(async () => {
		await prisma.$disconnect();
	});
