import {Item, ITEM_TYPE} from "./item";
/**
 * Created by zhannalibman on 26/02/2017.
 */


export class File extends Item {

    private content: string;

    constructor (id: number, name: string, content: string) {
        super(id, name, ITEM_TYPE.File);
        this.content = content;
    }

    setContent (content: string): void {
        this.content = content;
    }

    getContent (): string {
        return this.content;
    }

}

//API:
// constructor(id, name, content)
// rename(newName)
// setContent(content)
// getContent()
// getId()
// getType()

