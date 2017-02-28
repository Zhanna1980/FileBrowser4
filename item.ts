/**
 * Created by zhannalibman on 25/02/2017.
 */

export const enum ITEM_TYPE {
    Folder,
    File
}

export class Item {

    private id: number;
    private name: string;
    private type: ITEM_TYPE;

    constructor (id: number, name: string, type: ITEM_TYPE) {
        this.id = id;
        this.name = name;
        this.type = type;
    }

    rename (newName: string): void {
        this.name = newName;
    }

    getName (): string {
        return this.name;
    }

    getId (): number {
        return this.id;
    }

    getType (): ITEM_TYPE {
        return this.type;
    }
}


