import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Commitment } from "../utils/types";
import { fetchInvestor } from "../utils/dataFetching";
import { formatLargeNumber } from "../utils/numberFormat";

export const Route = createFileRoute("/investor/$name")({
  component: InvestorComponent,
  loader: async ({ params }) => {
    return await fetchInvestor(params.name);
  },
});

const columnHelper = createColumnHelper<Commitment>();

const columns = [
  columnHelper.accessor("assetClass", {
    header: "Asset Class",
  }),
  columnHelper.accessor("dateAdded", {
    header: "Date Added",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("lastUpdated", {
    header: "Last Updated",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("amount", {
    header: "Amount (£)",
    cell: (info) => info.getValue().toLocaleString(),
  }),
];

function InvestorComponent() {
  const investor = Route.useLoaderData();
  const { name } = Route.useParams();
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 15, //default page size
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: investor.commitments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="p-2">
      <h3 className="text-xl font-bold mb-4">Commitments for {name}</h3>
      <Link
        to="/"
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {"<-"} Back to all investors
      </Link>
      <div className="mt-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setColumnFilters([])}
          className={`px-4 py-2 rounded-md ${
            columnFilters.length === 0
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <div>All</div>
          <div>{formatLargeNumber(investor.totalAmount)}</div>
        </button>
        {investor.assetsTotals.map((asset) => (
          <button
            key={asset.assetClass}
            onClick={() => {
              setColumnFilters([
                {
                  id: "assetClass",
                  value: asset.assetClass,
                },
              ]);
            }}
            className={`px-4 py-2 rounded-md ${
              columnFilters.some(
                (filter) =>
                  filter.id === "assetClass" &&
                  filter.value === asset.assetClass
              )
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <div>{asset.assetClass}</div>
            <div>{formatLargeNumber(asset.totalAmount)}</div>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto mt-4 mb-4">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="bg-gray-100 border border-gray-200 px-4 py-2 text-left"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border border-gray-200 px-4 py-2"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-2 mt-4">
          <button
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <select
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:pointer-events-none"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 15, 20, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
          <span className="text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>
      </div>
    </div>
  );
}
