"use client"

import type React from "react"

import { useState, useMemo, useCallback, useEffect } from "react"
import { ChevronDown, ChevronUp, Filter, Settings, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useFetchusePurchasedInsurances } from "@/hooks/use-fetch-purchased-insurances"

// Define the Application type based on the API response
type Application = {
  id: string
  [key: string]: string | number // Dynamic fields
}

// Sample API response
const sampleApiResponse = {
  columns: ["Full Name", "Age", "Insurance Type", "City", "Status"],
  data: [
    {
      id: "1",
      "Full Name": "John Doe",
      Age: 28,
      "Insurance Type": "Health",
      City: "New York",
      Status: "Pending",
    },
    {
      id: "2",
      "Full Name": "Jane Smith",
      Age: 32,
      "Insurance Type": "Life",
      City: "Los Angeles",
      Status: "Approved",
    },
    {
      id: "3",
      "Full Name": "Robert Johnson",
      Age: 45,
      "Insurance Type": "Auto",
      City: "Chicago",
      Status: "In Review",
    },
    {
      id: "4",
      "Full Name": "Emily Davis",
      Age: 29,
      "Insurance Type": "Home",
      City: "Houston",
      Status: "Approved",
    },
    {
      id: "5",
      "Full Name": "Michael Wilson",
      Age: 38,
      "Insurance Type": "Health",
      City: "Phoenix",
      Status: "Rejected",
    },
    {
      id: "6",
      "Full Name": "Sarah Brown",
      Age: 41,
      "Insurance Type": "Life",
      City: "Philadelphia",
      Status: "Pending",
    },
    {
      id: "7",
      "Full Name": "David Lee",
      Age: 35,
      "Insurance Type": "Auto",
      City: "San Antonio",
      Status: "In Review",
    },
    {
      id: "8",
      "Full Name": "Lisa Garcia",
      Age: 27,
      "Insurance Type": "Health",
      City: "San Diego",
      Status: "Approved",
    },
    {
      id: "9",
      "Full Name": "Thomas Martinez",
      Age: 52,
      "Insurance Type": "Home",
      City: "Dallas",
      Status: "Rejected",
    },
    {
      id: "10",
      "Full Name": "Jennifer Robinson",
      Age: 39,
      "Insurance Type": "Life",
      City: "San Jose",
      Status: "Pending",
    },
    {
      id: "11",
      "Full Name": "William Clark",
      Age: 44,
      "Insurance Type": "Health",
      City: "Austin",
      Status: "Approved",
    },
    {
      id: "12",
      "Full Name": "Patricia Lewis",
      Age: 31,
      "Insurance Type": "Auto",
      City: "Jacksonville",
      Status: "In Review",
    },
  ],
}

// Define column configuration
type ColumnDef = {
  id: string
  header: string
  accessorKey: string
  sortable: boolean
  filterable: boolean
  cell?: (value: any, row: Application) => React.ReactNode
}

export function DynamicApplicationsList() {

  const { data: apiResponse, isFetching } = useFetchusePurchasedInsurances();

  // State for API data
  const [apiData, setApiData] = useState<{
    columns: string[]
    data: Application[]
  }>({
    columns : [],
    data : []
  })

  // State for sorting
  const [sorting, setSorting] = useState<{ column: string | null; direction: "asc" | "desc" }>({
    column: null,
    direction: "asc",
  })

  // State for filtering
  const [filters, setFilters] = useState<Record<string, string>>({})

  // State for visible columns
  const [visibleColumns, setVisibleColumns] = useState<string[]>(apiData.columns)

  // State for selected rows
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // State for column customization modal
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false)

  // State for filter modal
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null)
  const [filterValue, setFilterValue] = useState("")

  // FEATURE: Pagination for table
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const pageSizeOptions = [5, 10, 20, 50]

  useEffect(() => {
    if (apiResponse) {
      setApiData({
        columns: apiResponse.columns,
        data: apiResponse.data
      });
      setVisibleColumns(apiResponse.columns);
    }
  }, [apiResponse]);
  
  // Update visible columns when API data changes
  useEffect(() => {
    setVisibleColumns(apiData.columns)
  }, [apiData.columns])

  // Generate column definitions from API data
  const columns = useMemo<ColumnDef[]>(() => {
    return apiData.columns.map((column) => {
      // Special rendering for Status column
      if (column === "Status") {
        return {
          id: column,
          header: column,
          accessorKey: column,
          sortable: true,
          filterable: true,
          cell: (value, row) => {
            const statusStyles: Record<string, string> = {
              Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
              Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
              Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
              "In Review": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            }

            const style =
              statusStyles[value as string] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"

            return <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>{value}</span>
          },
        }
      }

      // Default column definition
      return {
        id: column,
        header: column,
        accessorKey: column,
        sortable: true,
        filterable: true,
      }
    })
  }, [apiData.columns])

  // Handle sorting
  const handleSort = useCallback((column: string) => {
    setSorting((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }))
  }, [])

  // Handle filtering
  const handleFilter = useCallback((column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }))
    setShowFilterModal(false)
    setActiveFilterColumn(null)
    setFilterValue("")

    // FEATURE: Pagination for table
    // Reset to first page when filtering
    setCurrentPage(1)
  }, [])

  // Handle removing a filter
  const handleRemoveFilter = useCallback((column: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[column]
      return newFilters
    })

    // FEATURE: Pagination for table
    // Reset to first page when removing a filter
    setCurrentPage(1)
  }, [])

  // Handle row selection
  const handleSelectRow = useCallback((id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }, [])

  // Handle select all rows (only for current page)
  const handleSelectAllRows = useCallback(() => {
    const currentPageIds = paginatedData.map((row) => row.id)

    if (currentPageIds.every((id) => selectedRows.includes(id))) {
      // If all rows on current page are selected, deselect them
      setSelectedRows((prev) => prev.filter((id) => !currentPageIds.includes(id)))
    } else {
      // Otherwise, select all rows on current page
      const newSelectedRows = [...selectedRows]
      currentPageIds.forEach((id) => {
        if (!newSelectedRows.includes(id)) {
          newSelectedRows.push(id)
        }
      })
      setSelectedRows(newSelectedRows)
    }
  }, [selectedRows])

  // Handle toggling column visibility
  const handleToggleColumn = useCallback((columnId: string) => {
    setVisibleColumns((prev) => (prev.includes(columnId) ? prev.filter((id) => id !== columnId) : [...prev, columnId]))
  }, [])

  // Apply sorting and filtering
  const filteredData = useMemo(() => {
    // First apply filters
    let result = [...apiData.data]

    Object.entries(filters).forEach(([column, value]) => {
      result = result.filter((row) => {
        const cellValue = String(row[column] || "").toLowerCase()
        return cellValue.includes(value.toLowerCase())
      })
    })

    // Then apply sorting
    if (sorting.column) {
      result.sort((a, b) => {
        const aValue = a[sorting.column as string]
        const bValue = b[sorting.column as string]

        if (aValue === undefined) return sorting.direction === "asc" ? -1 : 1
        if (bValue === undefined) return sorting.direction === "asc" ? 1 : -1

        // Handle numeric values
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sorting.direction === "asc" ? aValue - bValue : bValue - aValue
        }

        // Handle string values
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sorting.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        // Fallback for mixed types
        const aString = String(aValue)
        const bString = String(bValue)

        return sorting.direction === "asc" ? aString.localeCompare(bString) : bString.localeCompare(aString)
      })
    }

    return result
  }, [apiData.data, filters, sorting])

  // FEATURE: Pagination for table
  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / pageSize)

  // FEATURE: Pagination for table
  // Get data for current page
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  // FEATURE: Pagination for table
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // FEATURE: Pagination for table
  // Handle page size change
  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(e.target.value)
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }, [])

  // Get visible columns
  const visibleColumnDefs = useMemo(() => {
    return columns.filter((column) => visibleColumns.includes(column.id))
  }, [columns, visibleColumns])

  // Fetch data from API (simulated)
  useEffect(() => {
    // In a real application, you would fetch data from an API here
    // For now, we'll use the sample data
    // Example of how you would fetch data:
    // async function fetchData() {
    //   try {
    //     const response = await fetch('/api/applications')
    //     const data = await response.json()
    //     setApiData(data)
    //   } catch (error) {
    //     console.error('Error fetching data:', error)
    //   }
    // }
    //
    // fetchData()
  }, [])

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Applications ({filteredData.length})</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="sr-only">Filter</span>
          </button>
          <button
            onClick={() => setShowColumnCustomizer(true)}
            className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="sr-only">Customize Columns</span>
          </button>
        </div>
      </div>

      {/* Active filters */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(filters).map(([column, value]) => (
            <div
              key={column}
              className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
            >
              <span>
                {column}: {value}
              </span>
              <button
                onClick={() => handleRemoveFilter(column)}
                className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
              >
                <X className="w-3 h-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </div>
          ))}
          <button onClick={() => setFilters({})} className="text-sm text-primary hover:underline">
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && paginatedData.every((row) => selectedRows.includes(row.id))}
                      onChange={handleSelectAllRows}
                      className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                    />
                  </div>
                </th>
                {visibleColumnDefs.map((column) => (
                  <th key={column.id} className="px-4 py-3 text-left font-medium text-sm">
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <button onClick={() => handleSort(column.accessorKey)} className="ml-1 focus:outline-none">
                          {sorting.column === column.accessorKey ? (
                            sorting.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          ) : (
                            <div className="w-4 h-4 flex flex-col opacity-30">
                              <ChevronUp className="w-4 h-4 -mb-1" />
                              <ChevronDown className="w-4 h-4 -mt-1" />
                            </div>
                          )}
                        </button>
                      )}
                      {column.filterable && (
                        <button
                          onClick={() => {
                            setActiveFilterColumn(column.id)
                            setShowFilterModal(true)
                            setFilterValue(filters[column.id] || "")
                          }}
                          className={`ml-1 focus:outline-none ${filters[column.id] ? "text-primary" : "opacity-30 hover:opacity-100"}`}
                        >
                          <Filter className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
             
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-muted/50 ${selectedRows.includes(row.id) ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                      />
                    </td>
                    {visibleColumnDefs.map((column) => (
                      <td key={column.id} className="px-4 py-3">
                        {column.cell ? column.cell(row[column.accessorKey], row) : row[column.accessorKey] || "-"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <>
                 {isFetching ? (
                 <tr>
                  <td colSpan={visibleColumnDefs.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                      loading...
                  </td>
                </tr>
                ) : (
                  <tr>
                  <td colSpan={visibleColumnDefs.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                     No applications found
                  </td>
                </tr>
                )}
                </>
               
              )}
            </tbody>
          </table>
        </div>

        {/* FEATURE: Pagination for table */}
        {/* Pagination controls */}
        {filteredData.length > 0 && (
          <div className="border-t border-border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                {filteredData.length} entries
              </span>
              <div className="flex items-center space-x-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1 bg-background border border-input rounded-md text-sm"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>per page</span>
              </div>
            </div>

            <div className="flex items-center justify-end mt-3 sm:mt-0">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                  aria-label="First page"
                >
                  <span className="sr-only">First page</span>
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-2" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                  aria-label="Previous page"
                >
                  <span className="sr-only">Previous page</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                  aria-label="Next page"
                >
                  <span className="sr-only">Next page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                  aria-label="Last page"
                >
                  <span className="sr-only">Last page</span>
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Column customizer modal */}
      {showColumnCustomizer && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Customize Columns</h3>
              <button
                onClick={() => setShowColumnCustomizer(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`column-${column.id}`}
                    checked={visibleColumns.includes(column.id)}
                    onChange={() => handleToggleColumn(column.id)}
                    className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`column-${column.id}`} className="ml-2 text-sm">
                    {column.header}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowColumnCustomizer(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Filter</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="filter-column" className="block text-sm font-medium mb-1">
                  Column
                </label>
                <select
                  id="filter-column"
                  value={activeFilterColumn || ""}
                  onChange={(e) => setActiveFilterColumn(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select column</option>
                  {columns
                    .filter((col) => col.filterable)
                    .map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.header}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label htmlFor="filter-value" className="block text-sm font-medium mb-1">
                  Value
                </label>
                <input
                  id="filter-value"
                  type="text"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  placeholder="Filter value..."
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 border border-input bg-background hover:bg-muted transition-colors rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeFilterColumn && filterValue) {
                    handleFilter(activeFilterColumn, filterValue)
                  }
                }}
                disabled={!activeFilterColumn || !filterValue}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected rows actions */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card text-card-foreground shadow-lg rounded-lg p-4 flex items-center space-x-4 border border-border">
          <span>{selectedRows.length} selected</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Export
            </button>
            <button className="px-3 py-1 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors">
              Delete
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

