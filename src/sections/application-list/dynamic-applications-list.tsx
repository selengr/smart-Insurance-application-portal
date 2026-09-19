"use client";

import type React from "react";
import Link from "next/link";

import { AnimatePresence } from "motion/react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ITabelRow, TColumnDef } from "@/types/purchased-insurances";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { useFetchPurchasedInsurances } from "@/hooks/use-fetch-purchased-insurances";
import { insuranceTypeFromFormId } from "@/lib/local-applications";

export function DynamicApplicationsList({
  labels,
  productTitles,
  lang,
}: {
  labels: {
    applications: string
    columns: Record<string, string>
    status: Record<string, string>
    filter: string
    customize: string
    clearAll: string
    noApps: string
    noAppsHint: string
    loadError: string
    retry: string
    showing: string
    to: string
    of: string
    entries: string
    show: string
    perPage: string
    applyNew: string
    demoApplicant: string
  }
  productTitles?: Record<string, string>
  lang: string
}) {
  const { data: apiResponse, isFetching, isError, refetch } = useFetchPurchasedInsurances();

  const [apiData, setApiData] = useState<{
    columns: string[];
    data: ITabelRow[];
  }>({
    columns: [],
    data: [],
  });

  const [sorting, setSorting] = useState<{
    column: string | null;
    direction: "asc" | "desc";
  }>({
    column: null,
    direction: "asc",
  });

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    apiData.columns
  );
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(
    null
  );
  const [filterValue, setFilterValue] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const pageSizeOptions = [5, 10, 20, 50];

  useEffect(() => {
    if (apiResponse) {
      const statusKeys = ["Pending", "Approved", "Rejected", "In Review"];
      const columns = apiResponse.columns.includes("Status")
        ? [...apiResponse.columns]
        : [...apiResponse.columns, "Status"];
      const data = apiResponse.data.map((item: ITabelRow, index) => {
        const formId = typeof item.formId === "string" ? item.formId : undefined
        const typeLabel = formId
          ? insuranceTypeFromFormId(formId, productTitles)
          : String(item["Insurance Type"] ?? "")
        const statusKey =
          (item.Status as string) ?? statusKeys[index <= 3 ? index : 1]
        const applicant =
          item.Applicant === "Demo User"
            ? labels.demoApplicant
            : item.Applicant
        return {
          ...item,
          "Insurance Type": typeLabel,
          Applicant: applicant,
          Status: labels.status[statusKey] ?? statusKey,
          _statusKey: statusKey,
        }
      });
      setApiData({ columns, data });
      setVisibleColumns(columns);
    }
  }, [apiResponse, labels.status, labels.demoApplicant, productTitles]);

  useEffect(() => {
    setVisibleColumns(apiData.columns);
  }, [apiData.columns]);

  const columns = useMemo<TColumnDef[]>(() => {
    return apiData.columns.map((column) => {
      if (column === "Status") {
        return {
          id: column,
          header: labels.columns[column] ?? column,
          accessorKey: column,
          sortable: true,
          filterable: true,
          cell: (value, row) => {
            const statusKey = String(row._statusKey ?? value)
            const statusStyles: Record<string, string> = {
              Pending:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
              Approved:
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
              Rejected:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
              "In Review":
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            };

            const style =
              statusStyles[statusKey] ||
              "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

            return (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}
              >
                {value}
              </span>
            );
          },
        };
      }

      return {
        id: column,
        header: labels.columns[column] ?? column,
        accessorKey: column,
        sortable: true,
        filterable: true,
      };
    });
  }, [apiData.columns, labels.columns]);

  const handleSort = useCallback((column: string) => {
    setSorting((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleFilter = useCallback((column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    setShowFilterModal(false);
    setActiveFilterColumn(null);
    setFilterValue("");

    setCurrentPage(1);
  }, []);

  const handleRemoveFilter = useCallback((column: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });

    setCurrentPage(1);
  }, []);

  const handleToggleColumn = useCallback((columnId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  }, []);

  const filteredData = useMemo(() => {
    let result = [...apiData.data];

    Object.entries(filters).forEach(([column, value]) => {
      result = result.filter((row) => {
        const cellValue = String(row[column] || "").toLowerCase();
        return cellValue.includes(value.toLowerCase());
      });
    });

    if (sorting.column) {
      result.sort((a, b) => {
        const aValue = a[sorting.column as string];
        const bValue = b[sorting.column as string];

        if (aValue === undefined) return sorting.direction === "asc" ? -1 : 1;
        if (bValue === undefined) return sorting.direction === "asc" ? 1 : -1;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sorting.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sorting.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        const aString = String(aValue);
        const bString = String(bValue);

        return sorting.direction === "asc"
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    }

    return result;
  }, [apiData.data, filters, sorting]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPageSize = Number(e.target.value);
      setPageSize(newPageSize);
      setCurrentPage(1);
    },
    []
  );

  const visibleColumnDefs = useMemo(() => {
    return columns.filter((column) => visibleColumns.includes(column.id));
  }, [columns, visibleColumns]);


  // if(!!!apiData.data) return <div> No applications found</div>

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3" role="alert">
        <p className="font-medium">{labels.loadError}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          {labels.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {labels.applications} ({filteredData.length})
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="sr-only">{labels.filter}</span>
          </button>
          <button
            onClick={() => setShowColumnCustomizer(true)}
            className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="sr-only">{labels.customize}</span>
          </button>
        </div>
      </div>

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
          <button
            onClick={() => setFilters({})}
            className="text-sm text-primary hover:underline"
          >
            {labels.clearAll}
          </button>
        </div>
      )}

      <div className="border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                {visibleColumnDefs?.map((column,index) => (
                  <th
                    key={`${column.id}.${index}`}
                    className="px-4 py-3 text-left font-medium text-sm"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.accessorKey)}
                          className="ml-1 focus:outline-none"
                        >
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
                            setActiveFilterColumn(column.id);
                            setShowFilterModal(true);
                            setFilterValue(filters[column.id] || "");
                          }}
                          className={`ml-1 focus:outline-none ${
                            filters[column.id]
                              ? "text-primary"
                              : "opacity-30 hover:opacity-100"
                          }`}
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
              <AnimatePresence>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <tr key={row.id} className={`hover:bg-muted/50`}>
                      {visibleColumnDefs?.map((column,index) => (
                        <td key={`${column.id}.table.${index}`} className="px-4 py-3">
                          {column.cell
                            ? column.cell(row[column.accessorKey], row)
                            : row[column.accessorKey] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <>
                    {isFetching ? (
                      <tr>
                        <td
                          colSpan={Math.max(visibleColumnDefs?.length || 1, 1)}
                          className="px-4 py-10 text-center text-muted-foreground"
                          role="status"
                          aria-live="polite"
                        >
                          <div className="mx-auto mb-3 h-2 w-40 animate-pulse rounded bg-muted" />
                          <div className="mx-auto mb-2 h-2 w-56 animate-pulse rounded bg-muted" />
                          <div className="mx-auto h-2 w-48 animate-pulse rounded bg-muted" />
                          <span className="sr-only">Loading applications…</span>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td
                          colSpan={Math.max(visibleColumnDefs.length || 1, 1)}
                          className="px-4 py-12 text-center"
                          role="status"
                        >
                          <p className="text-base font-medium">{labels.noApps}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {labels.noAppsHint}
                          </p>
                          <Link
                            href={`/${lang}#products`}
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                          >
                            {labels.applyNew}
                            <ArrowUpRight className="h-4 w-4" aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredData.length > 0 && (
          <div className="border-t border-border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>
                {labels.showing} {(currentPage - 1) * pageSize + 1} {labels.to}{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} {labels.of}{" "}
                {filteredData.length} {labels.entries}
              </span>
              <div className="flex items-center space-x-2">
                <span>{labels.show}</span>
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
                <span>{labels.perPage}</span>
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

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
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {showColumnCustomizer && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{labels.customize}</h3>
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
                  <label
                    htmlFor={`column-${column.id}`}
                    className="ml-2 text-sm"
                  >
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

      {showFilterModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{labels.filter}</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="filter-column"
                  className="block text-sm font-medium mb-1"
                >
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
                <label
                  htmlFor="filter-value"
                  className="block text-sm font-medium mb-1"
                >
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
                    handleFilter(activeFilterColumn, filterValue);
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
    </div>
  );
}
