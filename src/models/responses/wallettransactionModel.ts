// Wallet Transaction Model
export interface WalletTransaction {
    wallettransaction_id: number;
    user_id: number; // Foreign Key to User
    amount: number; // DECIMAL(12,2)
    wallettransaction_date: Date | string; // DATETIME - ควรแปลงเป็น Date object หรือ string ISO format
}