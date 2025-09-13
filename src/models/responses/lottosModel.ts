export interface Lottos {
    lid:          number;
    lotto_number: string;
    price:        number;
    is_sold:      number;
    is_claim:     number;
    uid:          number | null;
    pid:          number;
}
