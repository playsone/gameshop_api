import  express  from "express";
import { getAllUsers, getUserByEmail } from "../controllers/user_api";
import { getAllLottos } from "../controllers/lotto_api";

const router = express.Router();
// index
router.get("/", (req, res) => {
    res.send("API_JackpotHub")
});

// user api
router.get("/users", getAllUsers);
router.get("/users/:email", getUserByEmail);

// lotto api
router.get("/lottos", getAllLottos);

export default router;