'use client';

import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T extends { id?: string | number }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
  striped?: boolean;
}

function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  className = '',
  striped = false,
}: DataTableProps<T>) {
  const getCellValue = (row: T, accessor: Column<T>['accessor']) => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return (row[accessor] as React.ReactNode) ?? '-';
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="data-table w-full">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-text-tertiary">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={col.className}>
                    {getCellValue(row, col.accessor)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
