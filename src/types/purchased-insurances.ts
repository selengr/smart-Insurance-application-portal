
// export interface ITabelRow {
//     id: string;
//     "Full Name": string;
//     Age: number;
//     "Insurance Type": string;
//     City: string;
//     Status: string;
// }
type ITabelRow = {
    id: string
    [key: string]: string | number 
}


export interface ITabelData {
    columns: string[];
    data: ITabelRow[];
}