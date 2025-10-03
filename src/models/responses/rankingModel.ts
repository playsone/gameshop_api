// Game Ranking Model
export interface GameRanking {
    ranking_id: number;
    game_id: number; // Foreign Key to Game
    ranking_date: Date | string; // DATETIME
}