import express from "express";
import {
	createNewUser,
	authenticateUser,
	logOutUser,
} from "../controllers/UserController";

const authRouter = express.Router();

// create a new user
authRouter.post("/signup", createNewUser);

// authenticate user
authRouter.post("/login", authenticateUser);

// logout user
authRouter.post("/logout", logOutUser);

export default authRouter;
