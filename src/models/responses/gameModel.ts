// Game Model
export interface Game {
    game_id: number;
    name: string;
    price: number; // DECIMAL(12,2)
    release_date: Date | string | null; // DATE - อาจเป็น Date object หรือ string ISO format หรือ null
    description: string | null; // TEXT - สามารถเป็น null ได้
    image: string | null; // VARCHAR(255) - สามารถเป็น null ได้
    type_id: number; // Foreign Key to GameType
}