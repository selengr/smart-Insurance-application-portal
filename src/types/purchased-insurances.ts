

export type TColumnDef = {
    id: string
    header: string
    accessorKey: string
    sortable: boolean
    filterable: boolean
    cell?: (value: any, row: ITabelRow) => React.ReactNode
  }

export interface ITabelRow {
    id: string
    [key: string]: string | number 
}


export interface ITabelData {
    columns: string[];
    data: ITabelRow[];
}