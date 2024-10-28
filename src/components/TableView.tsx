import { ReactGrid, CellChange, Column, Id, TextCell } from "@silevis/reactgrid";


interface TableViewProps {
    tableName: string | null;
}

const TableView: React.FC<TableViewProps> = ({ tableName }) => {
    return (
    <div>
        Table view: {tableName}
    </div>
    );
};



export default TableView;