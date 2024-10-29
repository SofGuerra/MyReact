export class ColumnHeaders {
    public name: string = "";
    public type: string = "string";
}

export class TableHeaders {
    public columns: ColumnHeaders[] = [];
    public tableName: string | null = "";

    public constructor (tableName: string | null) {
        this.tableName = tableName;
    }
}

