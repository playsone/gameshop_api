// User Game Library Model
export interface UsersGameLibrary {
    usergame_id: number;
    user_id: number; // Foreign Key to User
    game_id: number; // Foreign Key to Game
    purchase_date: Date | string; // DATETIME
}