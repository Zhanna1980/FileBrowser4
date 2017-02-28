import {Item, ITEM_TYPE} from "./item";
/**
 * Created by zhannalibman on 26/02/2017.
 */

export class Folder extends Item {

    private children: Item[];

    constructor (id: number, name: string) {
        super(id, name, ITEM_TYPE.Folder);
        this.children = [];
    }

    /**
     * Deletes the child with given id.
     * @param id - the id of the child item.
     * */
    deleteChild (id: number): void {
        const index = this.findChildIndexById(id);
        if (index != -1) {
            this.children.splice(index, 1);
        }
    }

    /**
     * Returns the index of the child item in the array of subitems
     * @param id - child item id
     * @return index of the item in the children array or -1 if not found.
     * */
    private findChildIndexById (id: number): number {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].getId() == id) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Pushes a new item to the array of subitems.
     * */
    addChild (item: Item): void {
        this.children.push(item);
        this.sortContent();
    }

    /**
     * Sorts by folder/file and alphabetically.
     * @return Array, sorted by folder/file and alphabetically.
     * */
    private sortContent (): void {
        this.children = this.children.sort(function (a, b) {
            //if both file or folder
            if (a.getType() == b.getType()) {
                return (a.getName()).localeCompare(b.getName());
            }

            return a.getType() === ITEM_TYPE.Folder ? -1 : 1;
        });
    }

    /**
     * Returns child with the specified id.
     * @param id - the id of the child.
     * @return child item with given id or null if not found.
     * */
    findChild (id: number): Item {
        var index = this.findChildIndexById(id);
        if (index == -1) {
            return null;
        }
        return this.children[index];
    }

    /**
     //  * Renames child item with given id.
     //  * @param newName - a new name.
     //  * @param childId - the id of the child item to be renamed.
     //  * */
    renameChild (newName: string, childId: number): void {
        if (this.findChildByName(newName) == null) {
            this.findChild(childId).rename(newName);
            this.sortContent();
        } else {
            throw new Error("Element with such name already exists.");
        }
    }

    /**
      * Searches for a child item with a given name.
      * @param childName - String, the name of the item that is searched for .
      * @return childItem or null if folder doesn't contain child item with the given name.
      **/
    findChildByName (childName: string): Item {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].getName() === childName) {
                return this.children[i];
            }
        }
        return null;
    };

    /**Returns the array of children.
     * @return Array of subitems.
     * */
    getChildren (): Item[] {
        return this.children;
    }

    /**
     * Checks if given folder has subfolders.
     * @return Boolean: true if it has subfolders and false if it has not.
     * */
    hasSubfolders (): boolean {
        var children = this.getChildren();
        for (var i = 0; i < children.length; i++) {
            if (children[i].getType() === ITEM_TYPE.Folder) {
                return true;
            }
        }
        return false;
    }
}


// API:
// constructor(id, name)
// deleteChild(id)
// rename(newName)
// addChild(Folder | File)
// findChild(id)
// getChildren()
// getId()
// getType()
