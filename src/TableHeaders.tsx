export class ColumnHeaders {
    public name: string = "";
    public type: string = "string";
    public id: number | null = null;
}

export class TableHeaders {
    public columns: ColumnHeaders[] = [];
    public tableName: string | null = "";
    public tableId: number | null = null;

    public constructor (tableId: number | null = null) {
        this.tableId = tableId;
    }
}

