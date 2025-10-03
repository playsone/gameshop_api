// Game Transaction Model
export interface GameTransaction {
    gametrans_id: number;
    user_id: number; // Foreign Key to User
    game_id: number; // Foreign Key to Game
    code_id: number | null; // Foreign Key to DiscountCode - สามารถเป็น NULL ได้
    bought_date: Date | string; // DATETIME
    price: number; // DECIMAL(12,2)
}