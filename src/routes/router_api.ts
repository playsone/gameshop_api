import express from "express";
import {
  buyLotto_api,
  getAllUsers_api,
  getLottoPrizeByUid_api,
  getUserByEmail_api,
  getUsersById_api,
  login_api,
  register_api,
  reset_api,
  setupDB_api,
} from "../controllers/user_api";
import {
  delLotto_api,
  getAllLottos_api,
  getSoldLottoNumber_api,
  getUnSoldLottoNumber_api,
  launch_api,
  newLotto_api,
  searchLottoNumber_api,
} from "../controllers/lotto_api";
import {
  checkTierPrizeLottos_api,
  claim_prize_api,
  getLottosOfPrizesByPrizeTier_api,
  getPrizes_api,
  randPrize_api,
} from "../controllers/prize_api";
import { test_api } from "../controllers/forTest_api";

const router = express.Router();
// index
router.get("/", (req, res) => {
  res.send("API_JackpotHub");
});

// test api
router.get("/test", test_api); //normal api get

// user api
router.get("/users", getAllUsers_api); // normal api get
router.get("/users/prizeOfUser", getLottoPrizeByUid_api); // send parameter get
router.post("/users/login", login_api); // normal api post
router.post("/users/register", register_api); //normal api post
router.get("/users/reset", reset_api); // normal api post
router.get("/users/setupDB", setupDB_api); // normal api post
router.get("/users/buy", buyLotto_api); // send query uid, lotto_number
router.get("/users/:uid", getUsersById_api); // send parameter get
router.get("/users/:email", getUserByEmail_api); // send parameter get


// lotto api
router.get("/lottos", getAllLottos_api); //normal api get
router.get("/lottos/sold", getSoldLottoNumber_api); //normal api get
router.get("/lottos/unsold", getUnSoldLottoNumber_api); //normal api get
router.get("/lottos/newLotto", newLotto_api);
router.get("/lottos/search/:num", searchLottoNumber_api);
router.get("/lottos/delLotto/:status", delLotto_api);
router.get("/lottos/launch", launch_api); //send parameter

// prize api
router.get("/prizes", getPrizes_api); //normal api get
router.get("/prizes/prizeTier", checkTierPrizeLottos_api); // send param by query string uid, lottos_number
router.get("/prizes/claimPrize", claim_prize_api); // send param by query string uid, lottos_number, can_claim
router.get("/prizes/randPrize", randPrize_api); // send by query string ex http://192.168.1.8:3000//lottos/randPrize?prize=7&is_sold=0
router.get("/prizes/getLPrizes/:prize", getLottosOfPrizesByPrizeTier_api); //send prizes 1-5

export default router;
