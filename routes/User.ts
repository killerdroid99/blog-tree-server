import express from "express";
import { createNewUser, authenticateUser } from "../controllers/UserController";

const authRouter = express.Router();

// create a new user
authRouter.post("/signup", createNewUser);

// authenticate user
authRouter.post("/login", authenticateUser);

export default authRouter;
