import "./TableView.css";
import { useEffect, useState } from "react";
import { TableHeaders } from "../TableHeaders";
import DataTable from "react-data-table-component";
import validations from "../validations.tsx";
import Cookies from "js-cookie";

interface TableViewProps {
  tableName: string | null;
}

const TableView: React.FC<TableViewProps> = ({ tableName }) => {
  const [tableHeaders, setTableHeaders] = useState(new TableHeaders(tableName));
  const [viewRows, setViewRows] = useState<any>([]);
  const [viewColumns, setViewColumns] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // When the tableName changes, fetch headers for that table
  useEffect(() => {
    let errorMessage1 = validations.validateTableName(tableName);
    setErrorMessage(errorMessage1);
    if (errorMessage1 != "") {
      return;
    }

    const token = Cookies.get("token");

    if (!token) return;

    fetch("/api/userTableHeaders", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tableName: tableName }),
    }).then((res) =>
      res.json().then((body) => {
        setTableHeaders(body.headers);
      })
    );
  }, [tableName]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
    field: any
  ) => {
    // Handle input change logic here
  };

  // When tableHeaders changes, fetch data from the table
  useEffect(() => {
    let errorMessage1 = validations.validateTableName(tableName);
    setErrorMessage(errorMessage1);
    if (errorMessage1 != "") {
      return;
    }

    for (let i = 0; i < tableHeaders.columns.length; i++) {
      errorMessage1 = validations.validateUserColumnName(
        tableHeaders.columns[i].name
      );
      if (errorMessage1 != "") {
        setErrorMessage(
          `Invalid column '${tableHeaders.columns[i].name}': ` + errorMessage1
        );
        return;
      }
    }

    //console.log(JSON.stringify(tableHeaders));

    let columns: any = [];
    tableHeaders.columns.forEach((columnHeader) => {
      columns.push({
        name: columnHeader.name,
        selector: (row: any) => row[columnHeader.name],
        cell: (row: any) => (
          <input
            type="text"
            value={row[columnHeader.name]}
            onChange={(e) => handleInputChange(e, row.id, columnHeader.name)}
          />
        ),
      });
    });

    const token = Cookies.get("token");

    if (!token) return;

    // Set the columns state
    setViewColumns(columns);
    fetch("/api/getData", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tableName: tableName,
        columnsNames: tableHeaders.columns.map((column) => column.name),
      }),
    }).then((res) => res.json().then((body) => setViewRows(body.rows)));
  }, [tableHeaders]);

  return (
    <div className="tableview1">
      <h1>{tableName}</h1>
      {errorMessage != "" && <p className="error">{errorMessage}</p>}
      {errorMessage == "" && (
        <DataTable
          title="Base Castigo Olimpica Agosto 2024"
          columns={viewColumns}
          data={viewRows}
          pagination
        />
      )}
    </div>
  );
};

export default TableView;
