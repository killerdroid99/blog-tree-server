import express from "express";
import {
	createNewUser,
	authenticateUser,
	logOutUser,
	currentUser,
	userProfilePicture,
	userProfileName,
	userProfileEmail,
	userPasswordChange,
	forgotPassword,
} from "../controllers/UserController";
import multer from "multer";
import path from "path";

const authRouter = express.Router();

// create a new user
authRouter.post("/signup", createNewUser);

// authenticate user
authRouter.post("/login", authenticateUser);

// logout user
authRouter.post("/logout", logOutUser);

// TODO: forgot password
authRouter.post("/forgot-password", forgotPassword);

// get current user
authRouter.get("/current", currentUser);

// setup multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/uploads");
	},
	filename: (req, file, cb) => {
		console.log(file);
		cb(null, req.session.userId + path.extname(file.originalname));
	},
});

const upload = multer({ storage });
// update user profile picture
authRouter.put("/profile/picture", upload.single("image"), userProfilePicture);

// update username
authRouter.put("/profile/name", userProfileName);

// update user's email
authRouter.put("/profile/email", userProfileEmail);

// update user's password
authRouter.put("/profile/password", userPasswordChange);

export default authRouter;
