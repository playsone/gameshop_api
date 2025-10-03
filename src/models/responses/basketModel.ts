// Basket Model
export interface Basket {
    bid: number;
    uid: number; // Foreign Key to User (user_id)
    game_id: number; // Foreign Key to Game
}