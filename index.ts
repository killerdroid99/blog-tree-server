import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/User";
import session from "express-session";
import Redis from "ioredis";
import postRouter from "./routes/BlogPost";
import { getUser } from "./controllers/UserController";
// import { sendEmail } from "./utils/sendEmail";

declare module "express-session" {
	export interface SessionData {
		userId: string;
	}
}

const RedisStore = require("connect-redis")(session);
const app = express();
export const redis = new Redis(process.env.REDIS_DB!);
export const prisma = new PrismaClient();

app.use(
	session({
		name: "qid",
		store: new RedisStore({
			client: redis,
			disableTouch: true,
		}),
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // setting max age for cookie = 10 years
			httpOnly: true,
			sameSite: "none",
			secure: process.env.PROD === "true" ? true : false,
			path: "/",
			domain: process.env.PROD === "true" ? process.env.CLIENT_URL : undefined,
		},
		saveUninitialized: false,
		secret: process.env.SECRET as string,
		resave: false,
	})
);

const corsOptions = {
	origin: process.env.CLIENT_URL, //Your Client, do not write '*'
	credentials: true,
};

app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());

async function main() {
	// sendEmail("bob@bob.com", "<h1>hello bob</h1>");
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

		res.json({ name: user?.name, id: user?.id });
	});

	app.get("/:id", getUser);

	app.use("/auth", authRouter);
	app.use("/api", postRouter);

	app.listen(process.env.PORT, () =>
		console.log(
			`listening on http://localhost:${process.env.PORT}, ${process.env.CLIENT_URL}`
		)
	);
}

main()
	.catch((e) => {
		throw e;
	})

	.finally(async () => {
		await prisma.$disconnect();
	});
