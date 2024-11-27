import "./TableView.css";
import { useEffect, useState } from "react";
import { TableHeaders } from "../TableHeaders";
import DataTable from "react-data-table-component";
import validations from "../validations.tsx";
import Cookies from "js-cookie";

interface TableViewProps {
  tableId: number | null;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize the first row and column of the matrix
  for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
  }

  // Populate the matrix with distances
  for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
              matrix[i - 1][j] + 1,      // Deletion
              matrix[i][j - 1] + 1,      // Insertion
              matrix[i - 1][j - 1] + cost // Substitution
          );
      }
  }

  // The last cell contains the Levenshtein distance
  return matrix[a.length][b.length];
}

function similarity(a: string, b: string): number {
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 100 : ((1 - distance / maxLength) * 100);
}


const TableView: React.FC<TableViewProps> = ({ tableId }) => {
  const [tableHeaders, setTableHeaders] = useState(new TableHeaders(tableId));
  const [viewRows, setViewRows] = useState<any>([]);
  const [rows1, setRows1] = useState<any>([]);
  const [viewColumns, setViewColumns] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // When the tableName changes, fetch headers for that table
  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) return;


    fetch("/api/userTableHeaders", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tableId: tableId }),
    }).then((res) =>
      res.json().then((body) => {
        setTableHeaders(body.headers);
      })
    );
  }, [tableId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
    field: any
  ) => {
    // Handle input change logic here
  };

  // When tableHeaders changes, fetch data from the table
  useEffect(() => {
    let errorMessage1 = "";
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
      if (columnHeader.id == null) return;
      const columnIdAsString = columnHeader.id.toString();
      const obj = {
        name: columnHeader.name,
        selector: (row: any) => row[columnIdAsString],
        sortable: true,
        cell: (row: any) => (
          <input
            type="text"
            value={row[columnIdAsString]}
            onChange={(e) => handleInputChange(e, row.id, columnIdAsString)}
          />
        ),
      }
      if (columnHeader.name == "Managed" || columnHeader.name == "NIT") {
        columns.unshift(obj);
        console.log(columnHeader.name);
      } else {
        columns.push(obj);
      }
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
        tableId: tableId,
        columnsIds: tableHeaders.columns.map((column) => column.id),
      }),
    }).then((res) => res.json().then((body) => {setRows1(body.rows);}));
  }, [tableHeaders]);

  const [nitSearch, setNitSearch] = useState("");

  useEffect(() => {
    if (rows1.length == 0) return;
    if (nitSearch == "") {
      setViewRows(rows1);
    } else 	{
      for (let row of rows1) {
        if (row.nit == nitSearch) {
        setViewRows([row]);
          return;
        };
      }
      setViewRows([]);
      
    }
  }, [nitSearch, rows1]);

  return (
    <div className="tableview1">
      {errorMessage != "" && <p className="error">{errorMessage}</p>}
      {errorMessage == "" && (
        <div>
          <input type="text" style={{marginBottom: "10px"}} placeholder="Search by Nit" value={nitSearch} onChange={(e) => setNitSearch(e.target.value)} />
          <DataTable
          title={tableHeaders.tableName}
            columns={viewColumns}
            data={viewRows}
            pagination 
            highlightOnHover
          />
        </div>
      )}
    </div>
  );
};

export default TableView;
