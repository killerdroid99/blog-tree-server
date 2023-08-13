import express from "express";
import {
	createNewUser,
	authenticateUser,
	logOutUser,
	currentUser,
} from "../controllers/UserController";

const authRouter = express.Router();

// create a new user
authRouter.post("/signup", createNewUser);

// authenticate user
authRouter.post("/login", authenticateUser);

// logout user
authRouter.post("/logout", logOutUser);

// get current user
authRouter.get("/current", currentUser);

export default authRouter;
