import {Folder} from "./folder";
import {File} from "./file";
import {ITEM_TYPE, Item} from "./item";
/**
 * Created by zhannalibman on 27/02/2017.
 */

interface ItemParentPair {
    item: Item,
    parent: Folder
}

interface SaveFormatObject {
    id: number,
    name: string,
    parent: number,
    type: ITEM_TYPE,
    content?: string
}

export class FileSystem {

    lastAddedId: number;
    root: Folder;


    constructor () {
        try {
            const fsStorageAsArray = JSON.parse(localStorage.getItem("saveArray"));
            this.fromSaveFormat(fsStorageAsArray);
        } catch (err) {
            this.lastAddedId = -1;
            this.root = new Folder(++this.lastAddedId, "root");
        }
    }

    /**
     * Adds new folder to a parent item.
     * @param name - a name of a new folder.
     * @param parentId - the id of the parent item.
     * */
    addFolder (name: string, parentId: number): void {
        this.createFileOrFolder(name, parentId, ITEM_TYPE.Folder);
    }

    /**
     * Adds new file to a parent item.
     * @param name - a name of a new file.
     * @param parentId - the id of the parent item.
     * @param content - string, text which will be stored in the file.
     * */
    addFile (name: string, parentId: number, content: string): void {
        this.createFileOrFolder(name, parentId, ITEM_TYPE.File, content);
    }

    /**
     * Renames item.
     * @param id - the id of the item to be renamed.
     * @param newName - String, the new item name.
     * */
    renameItem (id: number, newName: string): void {
        if (newName == undefined || newName.length == 0 || newName.indexOf("/") != -1) {
            throw new Error("Invalid item name.")
        } else if (id == 0) {
            this.root.rename(newName);
        } else {
            const parent = this.findParentByItemId(id);
            (parent as Folder).renameChild(newName, id);
        }
        this.saveData();
    }

    /**
     * Deletes item from fileSystem.
     * @param id - the id of the item that will be deleted.
     * */
    deleteItem (id: number): void {
        const parent = this.findParentByItemId(id);
        if (parent == null) {
            return;
        }
        (parent as Folder).deleteChild(id);
        this.saveData();
    }

    /**
     * Returns item according to the given parameter. if param is undefined the function returns root item.
     * @param param - path (as a string) or id (as a number)
     * @return item object or null if not found.
     * */
    getItem (param: number | string): Item {
        if (param == undefined) {
            return this.root;
        }
        if (typeof param == "number") {
            return this.findItemById(param);
        }
        if (typeof param == "string") {
            return this.findItemByPath(param);
        }
        return null;
    }
    /**
     * Gets path by item id
     * @param id - the id of the item.
     * @return String that represents the path.
     * */
    getPath (id: number): string {
        var path = this.generatePathByItem(this.getItem(id));
        // removes starting '/'
        return path.substr(1);
    }

    /**
     * Checks that the item is a folder
     * @param item - object in fsSystem
     * @return Boolean - true if the item is a folder and false if it is a file
     * */
    private isFolder (item: Item): boolean {
        return item.getType() === ITEM_TYPE.Folder;
    }

    /**
     * Finds item by its id
     * @param itemId - the id of the item
     * @return item object with given id
     * */
    private findItemById (itemId: number): Item {
        return this.findItemRecursive(itemId, this.root, null).item;
    }

    /**
     * Finds parent item by id of the child item
     * @param itemId - the id of the child item.
     * @return parent object.
     * */
    private findParentByItemId (itemId: number): Item {
        return this.findItemRecursive(itemId, this.root, null).parent;
    }

    /**
     * Searches recursively for an item in file system.
     * @param id - integer which is stored in item.id
     * @param item - object from which the function starts search
     * @param parent - parent object of item
     * @return object with item with given id and with parent item.
     * */
    private findItemRecursive (id: number, item: Item, parent: Folder): ItemParentPair {
        if (item.getId() == id) {
            return {item: item, parent: parent as Folder};
        }
        if (this.isFolder(item)) {
            const children = (item as Folder).getChildren();
            for (let i = 0; i < children.length; i++) {
                const result = this.findItemRecursive(id, children[i], item as Folder);
                if (result.item !== null) {
                    return result;
                }
            }
        }
        return {item: null, parent: null};
    }

    /**
     * Find item by given path.
     * @param path - String that represents an address in file system.
     * @return item or null if it was not found (invalid or wrong path).
     * */
    private findItemByPath (path: string): Item {
        const trimmedPath = path.trim();
        let elementsInPath = trimmedPath.split("/");
        if (elementsInPath[elementsInPath.length - 1] == "") {
            elementsInPath.pop();
        }
        let currentItem = null;
        if (elementsInPath.length > 0 && elementsInPath[0] == "root") {
            currentItem = this.root;
        } else {
            return null;
        }
        for (let i = 1; i < elementsInPath.length; i++) {
            currentItem = currentItem.findChildByName(elementsInPath[i]);
            if (currentItem == null) {
                return null;
            }
        }
        return currentItem;
    }

    /**
     * Generates path by item. Implementation detail of generatePathByElementId. Do not call directly.
     * @param item - object in the fsStorage.
     * @return String that represents the path (starting with '/').
     * */
    private generatePathByItem (item: Item) {
        if (item == null) {
            return "";
        }
        const parent = this.findParentByItemId(item.getId());
        return this.generatePathByItem(parent) + "/" + item.getName();
    };

    /**
     * Find unique name for file/folder inside the parent item.
     * @param itemName - supposed item name.
     * @param parent - parent item.
     * @return unique name with index if needed.
     * */
    private getUniqueName (itemName: string, parent: Folder): string {
        let counter = 0;
        let elementNameExists = true;
        while (elementNameExists) {
            let possibleName = counter > 0 ? (itemName + "(" + counter + ")") : itemName;
            if (parent.findChildByName(possibleName) == null) {
                return possibleName;
            }
            counter++;
        }
    }

    /**
     * Creates new file or folder.
     * @param name - the name of a new item.
     * @param parentId - the id of the parent folder to which a new item will be appended.
     * @param type - type of the new item.
     * @param content - content if the new item is a file.
     * */
    private createFileOrFolder (name: string, parentId: number, type: ITEM_TYPE, content?: string): void {
        let parent = this.getItem(parentId);
        if (!this.isFolder(parent)) {
            return;
        }
        let newItemName;
        let newItem;
        if (name !== undefined && name.length !== 0) {
            if ((parent as Folder).findChildByName(name) !== null) {
                throw new Error ("Element with such name already exists.");
            }
            newItemName = name;
        } else {
            let possibleName = type === ITEM_TYPE.Folder ? "new folder" : "new file.txt";
            newItemName = this.getUniqueName(possibleName, parent as Folder);
        }
        if (type === ITEM_TYPE.Folder) {
            newItem = new Folder(++this.lastAddedId, newItemName);
        } else {
            newItem = new File(++this.lastAddedId, newItemName, content);
        }
        (parent as Folder).getChildren().push(newItem);
        this.saveData();
    };

    /**
     * Converts recursively the file system to a flat array.
     * @param item - item of file system. First time the function is called with root item
     * @param parent - parent item. First time the function is called with null
     * @return Array - objects of file system in the flat array
     * */
    private toSaveFormat (item: Item, parent: Item) {
        let saveArray = [this.itemToSaveFormat(item, parent)];
        if (this.isFolder(item)) {
            let children = (item as Folder).getChildren();
            for (var i = 0; i < children.length; i++) {
                var arr = this.toSaveFormat(children[i], item);
                saveArray = saveArray.concat(arr);
            }
        }
        return saveArray;
    };

    /**
     * Converts the item to object for array
     * @param item - object at the runtime format
     * @param parent - parent item of the given object
     * @return object at the save format
     * */
    private itemToSaveFormat (item: Item, parent: Item): SaveFormatObject {
        const parentId: number = parent === null ? null : parent.getId();
        let element: SaveFormatObject = {id: item.getId(), parent: parentId, name: item.getName(), type: item.getType()};
        if (!this.isFolder(item)) {
            element.content = (item as File).getContent();
        }
        return element;
    };

    /**
     * Converts the object from the flat array to item.
     * @param objectInArray - object from saved array
     * @return item at the runtime format
     * */
    private itemFromSaveFormat (objectInArray: SaveFormatObject): Item {
        const type: ITEM_TYPE = objectInArray.type;
        if (type === ITEM_TYPE.Folder) {
            return new Folder(objectInArray.id, objectInArray.name);
        } else {
            return new File(objectInArray.id, objectInArray.name, objectInArray.content);
        }
    }

    /**
     * Converts flat array to fsStorage object
     * @param arr - fsStorage as array (saved format)
     * */
    private fromSaveFormat (arr: SaveFormatObject[]): void {
        //"root" always goes first in the array
        this.root = this.itemFromSaveFormat(arr[0]) as Folder;
        this.lastAddedId = 0;
        for (var i = 1; i < arr.length; i++) {
            //parent is always before child in the array
            (this.getItem(arr[i].parent) as Folder).addChild(this.itemFromSaveFormat(arr[i]));
            if (arr[i].id > this.lastAddedId) {
                this.lastAddedId = arr[i].id;
            }
        }
    }

    /**
     * Saves the data at the save format in the localStorage.
     * */
    private saveData (): void {
        try {
            const fsStorageAsArray = this.toSaveFormat(this.root, null);
            localStorage.setItem("saveArray", JSON.stringify(fsStorageAsArray));
        } catch(err) {
            alert("Error occurred while saving the data");
        }
    }

    //API:
    // constructor()
    // addFolder(name, parentId)
    // addFile(name, parentId, content)
    // renameItem(id, newName)
    // deleteItem(id)
    // getItem(path | id | undefined -> root)
    // getPath(id)

}














