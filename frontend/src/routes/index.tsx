import { createFileRoute, Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { fetchInvestors } from "../utils/dataFetching";
import { Investor } from "../utils/types";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: () => fetchInvestors(),
});

const columnHelper = createColumnHelper<Investor>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => (
      <Link
        to="/investor/$name"
        params={{ name: info.getValue() }}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("type", {
    header: "Type",
  }),
  columnHelper.accessor("country", {
    header: "Country",
  }),
  columnHelper.accessor("dateAdded", {
    header: "Date Added",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("totalCommitment", {
    header: "Total Commitment (£)",
    cell: (info) => info.getValue().toLocaleString(),
  }),
];

function HomeComponent() {
  const investors = Route.useLoaderData();

  const table = useReactTable({
    data: investors,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-2">
      <h3 className="text-2xl font-bold mb-4">Investors</h3>
      <div className="overflow-x-auto">
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
      </div>
    </div>
  );
}
