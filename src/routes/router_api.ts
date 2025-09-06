import  express  from "express";
import { getAllUsers, getUserByEmail, login, register, reset } from "../controllers/user_api";
import { getAllLottos, getSoldLottoNumber, getUnSoldLottoNumber, searchLottoNumber } from "../controllers/lotto_api";

const router = express.Router();
// index
router.get("/", (req, res) => {
    res.send("API_JackpotHub")
});

// user api
router.get("/users", getAllUsers);
router.get("/users/:email", getUserByEmail);
router.post("/users/login", login);
router.post('/users/register', register);
router.post('/users/reset', reset);

// lotto api
router.get("/lottos", getAllLottos);
router.get("/lottos/sold", getSoldLottoNumber);
router.get("/lottos/unsold", getUnSoldLottoNumber);
router.get("/lottos/search", getAllLottos);
router.get("/lottos/search/:num", searchLottoNumber);

export default router;