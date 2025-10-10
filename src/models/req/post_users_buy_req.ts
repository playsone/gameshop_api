import { Gamelist } from "./gamelist";

export interface PostUserBuyRequest {
  uid: string;
  games: [Gamelist];
  code_id: number;
  discount: number;
  total: number;
}
