import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/User";
import session from "express-session";
import Redis from "ioredis";
import postRouter from "./routes/BlogPost";
import { getUser } from "./controllers/UserController";
// import connectRedis from "connect-redis";

declare module "express-session" {
	export interface SessionData {
		userId: string;
	}
}

const RedisStore = require("connect-redis")(session);
const app = express();
let redisClient = new Redis();
export const prisma = new PrismaClient();

app.use(
	session({
		name: "qid",
		store: new RedisStore({
			client: redisClient,
			disableTouch: true,
		}),
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // setting max age for cookie = 10 years
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			path: "/",
		},
		saveUninitialized: false,
		secret: process.env.SECRET as string,
		resave: false,
	})
);

const corsOptions = {
	origin: "http://localhost:3000", //Your Client, do not write '*'
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

async function main() {
	app.get("/", async (req, res) => {
		if (!req.session.userId) {
			res.json({ msg: "not logged in" });
			return null;
		}
		const user = await prisma.user.findFirst({
			where: {
				id: req.session.userId,
			},
		});

		res.json(user?.name);
	});

	app.get("/:id", getUser);

	app.use("/auth", authRouter);
	app.use("/api", postRouter);

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
