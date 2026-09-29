"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  columnFilteringFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel,
  filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSortingFeature, sortFn_alphanumeric,
  sortFn_text, tableFeatures, useTable, type ColumnDef, type Row, type RowData,
} from "@tanstack/react-table";
import { Btn, Select, TextInput } from "./fields";

/* ============================================================
   DataTable — TanStack Table v9 (headless) + gaya admin.
   Fitur: pencarian global, sorting per kolom, pagination, ukuran halaman,
   kolom yang disembunyikan di layar kecil, klik baris.
   ============================================================ */

/** Fitur didaftarkan sekali di module scope (stabil antar render) */
export const dtFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export type DTFeatures = typeof dtFeatures;
export const columnHelper = <T extends RowData>() => createColumnHelper<DTFeatures, T>();

/** Definisi kolom untuk DataTable (nilai sel bisa bertipe apa saja) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DTColumn<T extends RowData> = ColumnDef<DTFeatures, T, any>;

export interface ColumnStyle {
  /** kelas untuk <th> & <td>, mis. "hidden md:table-cell" */
  className?: string;
  align?: "left" | "right";
}

const PAGE_SIZES = [10, 20, 50, 100];

export function DataTable<T extends RowData>({
  data,
  columns,
  columnStyles = {},
  getRowId,
  searchPlaceholder = "Search…",
  toolbar,
  emptyText = "Nothing here yet.",
  pageSize = 20,
  onRowClick,
  footerNote,
}: {
  data: T[];
  columns: DTColumn<T>[];
  columnStyles?: Record<string, ColumnStyle>;
  getRowId?: (row: T) => string;
  searchPlaceholder?: string;
  /** filter tambahan di samping kotak pencarian */
  toolbar?: ReactNode;
  emptyText?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  footerNote?: ReactNode;
}) {
  const table = useTable(
    {
      features: dtFeatures,
      columns,
      data,
      getRowId: getRowId ? (row: T) => getRowId(row) : undefined,
      globalFilterFn: "includesString",
      getColumnCanGlobalFilter: (column) => column.id !== "actions",
      initialState: { pagination: { pageIndex: 0, pageSize } },
      // data realtime berubah → jangan lompat ke halaman 1 setiap update
      autoResetPageIndex: false,
    },
    (state) => ({ sorting: state.sorting, pagination: state.pagination, globalFilter: state.globalFilter })
  );

  const { pageIndex, pageSize: size } = table.state.pagination;
  const filtered = table.getFilteredRowModel().rows.length;
  const from = filtered === 0 ? 0 : pageIndex * size + 1;
  const to = Math.min(filtered, (pageIndex + 1) * size);
  const style = (id: string) => columnStyles[id] ?? {};

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {/* toolbar */}
      <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-dim" />
          <TextInput
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={(table.state.globalFilter as string) ?? ""}
            onChange={(e) => {
              table.setGlobalFilter(e.target.value);
              table.setPageIndex(0);
            }}
            className="pl-8"
          />
        </div>
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="border-b border-line bg-surface-2/50 text-xs text-dim">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const s = style(header.column.id);
                  const sortable = header.column.getCanSort();
                  const dir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : undefined}
                      className={`px-4 py-2 font-normal ${s.align === "right" ? "text-right" : "text-left"} ${s.className ?? ""}`}
                    >
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={`-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-surface-2 hover:text-fg ${
                            dir ? "text-fg" : ""
                          } ${s.align === "right" ? "flex-row-reverse" : ""}`}
                        >
                          <table.FlexRender header={header} />
                          {dir === "asc" ? <ArrowUp size={12} /> : dir === "desc" ? <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted">
                  {table.state.globalFilter ? "No results for this search." : emptyText}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row: Row<DTFeatures, T>) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={`transition-colors hover:bg-surface-2/40 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {row.getAllCells().map((cell) => {
                    const s = style(cell.column.id);
                    return (
                      <td
                        key={cell.id}
                        onClick={cell.column.id === "actions" ? (e) => e.stopPropagation() : undefined}
                        className={`px-4 py-2.5 align-middle ${s.align === "right" ? "text-right" : ""} ${s.className ?? ""}`}
                      >
                        <table.FlexRender cell={cell} />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* footer: info + pagination */}
      <div className="flex flex-col gap-2 border-t border-line px-4 py-2.5 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
        <span>
          {filtered === 0 ? "0 results" : `${from}–${to} of ${filtered}`}
          {filtered !== data.length && ` (filtered from ${data.length})`}
          {footerNote && <> · {footerNote}</>}
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5">
            Rows
            <Select
              aria-label="Rows per page"
              value={size}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-7 w-[68px] px-2 text-xs"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
          </label>
          <span className="tabular-nums">
            {table.getPageCount() === 0 ? 0 : pageIndex + 1} / {table.getPageCount()}
          </span>
          <Btn size="sm" variant="ghost" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page" className="w-8 px-0">
            <ChevronLeft size={15} />
          </Btn>
          <Btn size="sm" variant="ghost" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page" className="w-8 px-0">
            <ChevronRight size={15} />
          </Btn>
        </div>
      </div>
    </div>
  );
}
