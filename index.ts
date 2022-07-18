import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
	app.post("/users", async (req, res) => {
		try {
			const newuser: object = await prisma.user.create({
				data: { ...req.body },
			});
			res.json({
				msg: "user added successfully",
				data: newuser,
			});
		} catch (error) {
			res.status(400).json({ msg: "there was some error", error });
		}
	});

	// update an existing user
	app.patch("/users/:id", async (req, res) => {
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
	app.delete("/users/:id", async (req, res) => {
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
