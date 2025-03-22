
export interface ITabelRow {
    id: string;
    "Full Name": string;
    Age: number;
    "Insurance Type": string;
    City: string;
    Status: string;
}


export interface ITabelData {
    columns: string[];
    data: ITabelRow[];
}