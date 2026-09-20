"use client";

import type React from "react";
import Link from "next/link";

import { AnimatePresence } from "motion/react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Search,
} from "lucide-react";
import { useFetchPurchasedInsurances } from "@/hooks/use-fetch-purchased-insurances";
import {
  applyDemoStatusProgress,
  insuranceTypeFromFormId,
  summarizeStatuses,
} from "@/lib/local-applications";
import { productVisual } from "@/lib/product-visuals";
import { statusChipClass } from "@/lib/status-styles";
import { PoliciesSummary, type StatusFilterKey } from "@/components/policies-summary";
import { FocusTrapDialog } from "@/components/focus-trap-dialog";
import Image from "next/image";

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
    done: string
    close: string
    column: string
    selectColumn: string
    value: string
    filterValue: string
    cancel: string
    applyFilter: string
    removeFilter: string
    firstPage: string
    prevPage: string
    nextPage: string
    lastPage: string
    loadingApps: string
    viewDetails: string
    openPolicy: string
    summaryPending: string
    summaryInReview: string
    summaryApproved: string
    summaryRejected: string
    loadErrorHint: string
    noAppsRecover: string
    searchPlaceholder: string
    searchLabel: string
    filterAll: string
    noFilterMatches: string
  }
  productTitles?: Record<string, string>
  lang: string
}) {
  const router = useRouter();
  const { data: apiResponse, isFetching, isError, refetch } = useFetchPurchasedInsurances();

  useEffect(() => {
    if (applyDemoStatusProgress()) {
      void refetch()
    }
    const onChanged = () => {
      void refetch()
    }
    window.addEventListener("sip:applications-changed", onChanged)
    window.addEventListener("storage", onChanged)
    return () => {
      window.removeEventListener("sip:applications-changed", onChanged)
      window.removeEventListener("storage", onChanged)
    }
  }, [refetch])

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
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    const defs = apiData.columns.map((column) => {
      if (column === "Status") {
        return {
          id: column,
          header: labels.columns[column] ?? column,
          accessorKey: column,
          sortable: true,
          filterable: true,
          cell: (value: string | number, row: ITabelRow) => {
            const statusKey = String(row._statusKey ?? value)
            return (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold tracking-wide ${statusChipClass(statusKey)}`}
              >
                {String(value)}
              </span>
            );
          },
        };
      }

      if (column === "id") {
        return {
          id: column,
          header: labels.columns[column] ?? column,
          accessorKey: column,
          sortable: true,
          filterable: true,
          cell: (value: string | number) => (
            <span className="font-mono text-sm text-primary">{String(value)}</span>
          ),
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

    return [
      ...defs,
      {
        id: "_actions",
        header: "",
        accessorKey: "id",
        sortable: false,
        filterable: false,
        cell: (_value: string | number, row: ITabelRow) => (
          <Link
            href={`/${lang}/purchased-insurances/${row.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            aria-label={`${labels.openPolicy} ${row.id}`}
          >
            {labels.viewDetails}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ),
      },
    ];
  }, [apiData.columns, labels.columns, labels.viewDetails, labels.openPolicy, lang]);

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

    if (statusFilter !== "all") {
      result = result.filter((row) => String(row._statusKey ?? row.Status) === statusFilter)
    }

    const query = searchQuery.trim().toLowerCase()
    if (query) {
      result = result.filter((row) => {
        const haystack = [
          row.id,
          row["Insurance Type"],
          row.Applicant,
          row.Status,
          row["Submitted At"],
          row.formId,
        ]
          .map((value) => String(value ?? "").toLowerCase())
          .join(" ")
        return haystack.includes(query)
      })
    }

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
  }, [apiData.data, filters, sorting, statusFilter, searchQuery]);

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
    const base = columns.filter(
      (column) => column.id !== "_actions" && visibleColumns.includes(column.id),
    );
    const actions = columns.find((column) => column.id === "_actions");
    return actions ? [...base, actions] : base;
  }, [columns, visibleColumns]);

  const statusCounts = useMemo(
    () =>
      summarizeStatuses(
        apiData.data.map((row) => ({
          Status: String(row._statusKey ?? row.Status ?? "Pending"),
        })),
      ),
    [apiData.data],
  );

  const onStatusSelect = useCallback((key: StatusFilterKey) => {
    setStatusFilter(key)
    setCurrentPage(1)
  }, [])

  if (isError) {
    return (
      <div className="border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3" role="alert">
        <p className="font-medium">{labels.loadError}</p>
        <p className="text-sm text-muted-foreground">{labels.loadErrorHint}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            {labels.retry}
          </button>
          <Link
            href={`/${lang}#products`}
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            {labels.applyNew}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PoliciesSummary
        counts={statusCounts}
        active={statusFilter}
        onSelect={onStatusSelect}
        labels={{
          all: labels.filterAll,
          pending: labels.summaryPending,
          inReview: labels.summaryInReview,
          approved: labels.summaryApproved,
          rejected: labels.summaryRejected,
        }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setCurrentPage(1)
            }}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchLabel}
            className="w-full border border-input bg-background py-2 pe-3 ps-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm text-muted-foreground">
            {labels.applications} · {filteredData.length}
          </p>
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
      </div>

      {apiData.data.length > 0 && filteredData.length === 0 ? (
        <div className="mb-4 border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm font-medium">{labels.noFilterMatches}</p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-primary hover:underline"
            onClick={() => {
              setStatusFilter("all")
              setSearchQuery("")
              setFilters({})
              setCurrentPage(1)
            }}
          >
            {labels.clearAll}
          </button>
        </div>
      ) : null}

      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(filters).map(([column, value]) => (
            <div
              key={column}
              className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
            >
              <span>
                {labels.columns[column] ?? column}: {value}
              </span>
              <button
                onClick={() => handleRemoveFilter(column)}
                className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
              >
                <X className="w-3 h-3" />
                <span className="sr-only">{labels.removeFilter}</span>
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

      <div className="border border-border overflow-hidden md:rounded-md">
        {/* Mobile portal cards */}
        <div className="space-y-3 p-3 md:hidden">
          {isFetching && paginatedData.length === 0 ? (
            <div className="space-y-3" role="status" aria-live="polite">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse border border-border bg-muted/40" />
              ))}
              <span className="sr-only">{labels.loadingApps}</span>
            </div>
          ) : paginatedData.length > 0 ? (
            paginatedData.map((row) => {
              const formId = typeof row.formId === "string" ? row.formId : ""
              const typeLabel = String(row["Insurance Type"] ?? "")
              const visual = productVisual(
                formId,
                (formId && productTitles?.[formId]) || typeLabel,
              )
              const statusKey = String(row._statusKey ?? row.Status)
              return (
                <Link
                  key={row.id}
                  href={`/${lang}/purchased-insurances/${row.id}`}
                  className="flex gap-3 border border-border bg-card/70 p-3 transition hover:border-primary/40"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-muted">
                    <Image
                      src={visual.src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-[family-name:var(--font-display)] text-base font-bold leading-tight">
                        {row["Insurance Type"]}
                      </p>
                      <span
                        className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[0.65rem] font-semibold ${statusChipClass(statusKey)}`}
                      >
                        {row.Status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {row.Applicant}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {row.id} · {row["Submitted At"]}
                    </p>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="border border-dashed border-border px-4 py-10 text-center">
              <p className="text-base font-medium">{labels.noApps}</p>
              <p className="mt-1 text-sm text-muted-foreground">{labels.noAppsHint}</p>
              <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
                {labels.noAppsRecover}
              </p>
              <Link
                href={`/${lang}#products`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {labels.applyNew}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                {visibleColumnDefs?.map((column,index) => (
                  <th
                    key={`${column.id}.${index}`}
                    className="px-4 py-3 text-start font-medium text-sm"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.accessorKey)}
                          className="ml-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    <tr
                      key={row.id}
                      className="group cursor-pointer hover:bg-muted/50"
                      onClick={(event) => {
                        const target = event.target as HTMLElement
                        if (target.closest("a,button,input,select,label")) return
                        router.push(`/${lang}/purchased-insurances/${row.id}`)
                      }}
                    >
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
                          <span className="sr-only">{labels.loadingApps}</span>
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
                          <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
                            {labels.noAppsRecover}
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
                  aria-label={labels.firstPage}
                >
                  <span className="sr-only">{labels.firstPage}</span>
                  <ChevronLeft className="w-4 h-4 -ml-2" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                  aria-label={labels.prevPage}
                >
                  <span className="sr-only">{labels.prevPage}</span>
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
                  aria-label={labels.nextPage}
                >
                  <span className="sr-only">{labels.nextPage}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                  aria-label={labels.lastPage}
                >
                  <span className="sr-only">{labels.lastPage}</span>
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      <FocusTrapDialog
        open={showColumnCustomizer}
        onClose={() => setShowColumnCustomizer(false)}
        labelledBy="column-customizer-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="column-customizer-title" className="text-lg font-medium">
            {labels.customize}
          </h3>
          <button
            type="button"
            onClick={() => setShowColumnCustomizer(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">{labels.close}</span>
          </button>
        </div>
        <div className="space-y-2">
          {columns
            .filter((column) => column.id !== "_actions")
            .map((column, index) => (
              <div key={column.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`column-${column.id}`}
                  checked={visibleColumns.includes(column.id)}
                  onChange={() => handleToggleColumn(column.id)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  data-autofocus={index === 0 ? true : undefined}
                />
                <label
                  htmlFor={`column-${column.id}`}
                  className="ms-2 text-sm"
                >
                  {column.header}
                </label>
              </div>
            ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowColumnCustomizer(false)}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {labels.done}
          </button>
        </div>
      </FocusTrapDialog>

      <FocusTrapDialog
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        labelledBy="filter-modal-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="filter-modal-title" className="text-lg font-medium">
            {labels.filter}
          </h3>
          <button
            type="button"
            onClick={() => setShowFilterModal(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">{labels.close}</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="filter-column"
              className="mb-1 block text-sm font-medium"
            >
              {labels.column}
            </label>
            <select
              id="filter-column"
              value={activeFilterColumn || ""}
              onChange={(e) => setActiveFilterColumn(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              data-autofocus
            >
              <option value="">{labels.selectColumn}</option>
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
              className="mb-1 block text-sm font-medium"
            >
              {labels.value}
            </label>
            <input
              id="filter-value"
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder={labels.filterValue}
              className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowFilterModal(false)}
            className="rounded-md border border-input bg-background px-4 py-2 transition-colors hover:bg-muted"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeFilterColumn && filterValue) {
                handleFilter(activeFilterColumn, filterValue);
              }
            }}
            disabled={!activeFilterColumn || !filterValue}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {labels.applyFilter}
          </button>
        </div>
      </FocusTrapDialog>
    </div>
  );
}
