import express from "express";
import {
  getAllUsers,
  getUserByEmail,
  login,
  register,
  reset,
} from "../controllers/user_api";
import {
  getAllLottos,
  getSoldLottoNumber,
  getUnSoldLottoNumber,
  searchLottoNumber,
} from "../controllers/lotto_api";
import { getLottosOfPrizesByPrizeTier, getPrizes, randPrize, test } from "../controllers/prize_api";

const router = express.Router();
// index
router.get("/", (req, res) => {
  res.send("API_JackpotHub");
});

// user api
router.get("/users", getAllUsers); // normal api get
router.get("/users/:email", getUserByEmail); // send parameter get
router.post("/users/login", login); // normal api post
router.post("/users/register", register); //normal api post
router.post("/users/reset", reset); // normal api post

// lotto api
router.get("/lottos", getAllLottos); //normal api get
router.get("/lottos/sold", getSoldLottoNumber); //normal api get
router.get("/lottos/unsold", getUnSoldLottoNumber); //normal api get
router.get("/lottos/search", getAllLottos); //normal api get
router.get("/lottos/search/:num", searchLottoNumber); //send parameter

// prize api
router.get("/prizes", getPrizes); //normal api get
router.get("/prizes/getLPrizes/:prize", getLottosOfPrizesByPrizeTier); //send prizes 1-5
router.get("/test", test); //normal api get
router.get("/prizes/randPrize", randPrize); // send by query string ex http://192.168.1.8:3000//lottos/randPrize?prize=7&is_sold=0

export default router;
