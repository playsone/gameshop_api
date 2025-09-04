import  express  from "express";
import { getAllUsers } from "../controllers/user_api";

const router = express.Router();

router.get("/users", getAllUsers);

export default router;