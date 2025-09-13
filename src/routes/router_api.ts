import express from "express";
import {
  getAllUsers_api,
  getUserByEmail_api,
  login_api,
  register_api,
  reset_api,
} from "../controllers/user_api";
import {
  getAllLottos_api,
  getSoldLottoNumber_api,
  getUnSoldLottoNumber_api,
  searchLottoNumber_api,
} from "../controllers/lotto_api";
import { checkTierPrizeLottos_api, getLottosOfPrizesByPrizeTier_api, getPrizes_api, randPrize_api, test_api } from "../controllers/prize_api";

const router = express.Router();
// index
router.get("/", (req, res) => {
  res.send("API_JackpotHub");
});

// user api
router.get("/users", getAllUsers_api); // normal api get
router.get("/users/:email", getUserByEmail_api); // send parameter get
router.post("/users/login", login_api); // normal api post
router.post("/users/register", register_api); //normal api post
router.post("/users/reset", reset_api); // normal api post

// lotto api
router.get("/lottos", getAllLottos_api); //normal api get
router.get("/lottos/sold", getSoldLottoNumber_api); //normal api get
router.get("/lottos/unsold", getUnSoldLottoNumber_api); //normal api get
router.get("/lottos/search", getAllLottos_api); //normal api get
router.get("/lottos/search/:num", searchLottoNumber_api); //send parameter

// prize api
router.get("/test", test_api); //normal api get
router.get("/prizes", getPrizes_api); //normal api get
router.get("/prizes/getLPrizes/:prize", getLottosOfPrizesByPrizeTier_api); //send prizes 1-5
router.get("/prizes/randPrize", randPrize_api); // send by query string ex http://192.168.1.8:3000//lottos/randPrize?prize=7&is_sold=0
router.get("/prizes/prizeTier", checkTierPrizeLottos_api); // send param by query string uid, lottos_number

export default router;
