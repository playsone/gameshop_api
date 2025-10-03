// Discount Code Model
export interface DiscountCode {
    code_id: number;
    code_name: string;
    discount_value: number; // DECIMAL(5,2)
    remaining_user: number;
    max_user: number;
}