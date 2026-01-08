"use client";

import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";


interface SortableTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
  }[];
  initialSortColumn?: keyof T;
  initialSortDirection?: "asc" | "desc";
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  actions?: (item: T) => React.ReactNode;
}

export function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  initialSortColumn,
  initialSortDirection = "asc",
  onRowClick,
  emptyMessage = "No data available",
  actions,
}: SortableTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<keyof T | null>(
    initialSortColumn || null
  );
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    initialSortDirection
  );
  const [sortedData, setSortedData] = React.useState<T[]>(data);

  

  // Theme-aware colors
  const accentColor = "hsl(var(--primary))";

  React.useEffect(() => {
    if (sortColumn) {
      const sorted = [...data].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn])
          return sortDirection === "asc" ? -1 : 1;
        if (a[sortColumn] > b[sortColumn])
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
      setSortedData(sorted);
    } else {
      setSortedData(data);
    }
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: keyof T }) => {
    if (sortColumn !== column)
      return <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" style={{ color: accentColor }} />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" style={{ color: accentColor }} />
    );
  };

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b dark:border-gray-700 text-sm md:text-base">
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className="py-2 font-medium text-[#333333] dark:text-white"
            >
              {column.sortable !== false ? (
                <button
                  className="flex items-center focus:outline-none"
                  onClick={() => handleSort(column.key)}
                >
                  {column.label}
                  <SortIcon column={column.key} />
                </button>
              ) : (
                column.label
              )}
            </th>
          ))}
          {actions && <th className="py-2"></th>}
        </tr>
      </thead>
      <tbody>
        {sortedData.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length + (actions ? 1 : 0)}
              className="py-4 text-center text-gray-500 dark:text-gray-400"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          sortedData.map((item, index) => (
            <tr
              key={index}
              className={`text-sm md:text-base border-b last:border-b-0 dark:border-gray-700 ${onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" : ""}`}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="py-3 text-[#333333] dark:text-white"
                >
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {actions && <td className="py-3">{actions(item)}</td>}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
