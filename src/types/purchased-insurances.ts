import type { ReactNode } from "react"

export type TColumnDef = {
  id: string
  header: string
  accessorKey: string
  sortable: boolean
  filterable: boolean
  cell?: (value: string | number, row: ITabelRow) => ReactNode
}

export interface ITabelRow {
  id: string
  [key: string]: string | number
}

export interface ITabelData {
  columns: string[]
  data: ITabelRow[]
}

/** Preferred aliases (typo-safe) */
export type ITableRow = ITabelRow
export type ITableData = ITabelData
