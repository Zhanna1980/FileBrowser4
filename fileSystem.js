"use strict";
var folder_1 = require("./folder");
var file_1 = require("./file");
var FileSystem = (function () {
    function FileSystem() {
        try {
            var fsStorageAsArray = JSON.parse(localStorage.getItem("saveArray"));
            this.fromSaveFormat(fsStorageAsArray);
        }
        catch (err) {
            this.lastAddedId = -1;
            this.root = new folder_1.Folder(++this.lastAddedId, "root");
        }
    }
    /**
     * Adds new folder to a parent item.
     * @param name - a name of a new folder.
     * @param parentId - the id of the parent item.
     * */
    FileSystem.prototype.addFolder = function (name, parentId) {
        this.createFileOrFolder(name, parentId, 0 /* Folder */);
    };
    /**
     * Adds new file to a parent item.
     * @param name - a name of a new file.
     * @param parentId - the id of the parent item.
     * @param content - string, text which will be stored in the file.
     * */
    FileSystem.prototype.addFile = function (name, parentId, content) {
        this.createFileOrFolder(name, parentId, 1 /* File */, content);
    };
    /**
     * Renames item.
     * @param id - the id of the item to be renamed.
     * @param newName - String, the new item name.
     * */
    FileSystem.prototype.renameItem = function (id, newName) {
        if (newName == undefined || newName.length == 0 || newName.indexOf("/") != -1) {
            throw new Error("Invalid item name.");
        }
        else if (id == 0) {
            this.root.rename(newName);
        }
        else {
            var parent_1 = this.findParentByItemId(id);
            parent_1.renameChild(newName, id);
        }
        this.saveData();
    };
    /**
     * Deletes item from fileSystem.
     * @param id - the id of the item that will be deleted.
     * */
    FileSystem.prototype.deleteItem = function (id) {
        var parent = this.findParentByItemId(id);
        if (parent == null) {
            return;
        }
        parent.deleteChild(id);
        this.saveData();
    };
    /**
     * Returns item according to the given parameter. if param is undefined the function returns root item.
     * @param param - path (as a string) or id (as a number)
     * @return item object or null if not found.
     * */
    FileSystem.prototype.getItem = function (param) {
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
    };
    /**
     * Gets path by item id
     * @param id - the id of the item.
     * @return String that represents the path.
     * */
    FileSystem.prototype.getPath = function (id) {
        var path = this.generatePathByItem(this.getItem(id));
        // removes starting '/'
        return path.substr(1);
    };
    /**
     * Checks that the item is a folder
     * @param item - object in fsSystem
     * @return Boolean - true if the item is a folder and false if it is a file
     * */
    FileSystem.prototype.isFolder = function (item) {
        return item.getType() === 0 /* Folder */;
    };
    /**
     * Finds item by its id
     * @param itemId - the id of the item
     * @return item object with given id
     * */
    FileSystem.prototype.findItemById = function (itemId) {
        return this.findItemRecursive(itemId, this.root, null).item;
    };
    /**
     * Finds parent item by id of the child item
     * @param itemId - the id of the child item.
     * @return parent object.
     * */
    FileSystem.prototype.findParentByItemId = function (itemId) {
        return this.findItemRecursive(itemId, this.root, null).parent;
    };
    /**
     * Searches recursively for an item in file system.
     * @param id - integer which is stored in item.id
     * @param item - object from which the function starts search
     * @param parent - parent object of item
     * @return object with item with given id and with parent item.
     * */
    FileSystem.prototype.findItemRecursive = function (id, item, parent) {
        if (item.getId() == id) {
            return { item: item, parent: parent };
        }
        if (this.isFolder(item)) {
            var children = item.getChildren();
            for (var i = 0; i < children.length; i++) {
                var result = this.findItemRecursive(id, children[i], item);
                if (result.item !== null) {
                    return result;
                }
            }
        }
        return { item: null, parent: null };
    };
    /**
     * Find item by given path.
     * @param path - String that represents an address in file system.
     * @return item or null if it was not found (invalid or wrong path).
     * */
    FileSystem.prototype.findItemByPath = function (path) {
        var trimmedPath = path.trim();
        var elementsInPath = trimmedPath.split("/");
        if (elementsInPath[elementsInPath.length - 1] == "") {
            elementsInPath.pop();
        }
        var currentItem = null;
        if (elementsInPath.length > 0 && elementsInPath[0] == "root") {
            currentItem = this.root;
        }
        else {
            return null;
        }
        for (var i = 1; i < elementsInPath.length; i++) {
            currentItem = currentItem.findChildByName(elementsInPath[i]);
            if (currentItem == null) {
                return null;
            }
        }
        return currentItem;
    };
    /**
     * Generates path by item. Implementation detail of generatePathByElementId. Do not call directly.
     * @param item - object in the fsStorage.
     * @return String that represents the path (starting with '/').
     * */
    FileSystem.prototype.generatePathByItem = function (item) {
        if (item == null) {
            return "";
        }
        var parent = this.findParentByItemId(item.getId());
        return this.generatePathByItem(parent) + "/" + item.getName();
    };
    ;
    /**
     * Find unique name for file/folder inside the parent item.
     * @param itemName - supposed item name.
     * @param parent - parent item.
     * @return unique name with index if needed.
     * */
    FileSystem.prototype.getUniqueName = function (itemName, parent) {
        var counter = 0;
        var elementNameExists = true;
        while (elementNameExists) {
            var possibleName = counter > 0 ? (itemName + "(" + counter + ")") : itemName;
            if (parent.findChildByName(possibleName) == null) {
                return possibleName;
            }
            counter++;
        }
    };
    /**
     * Creates new file or folder.
     * @param name - the name of a new item.
     * @param parentId - the id of the parent folder to which a new item will be appended.
     * @param type - type of the new item.
     * @param content - content if the new item is a file.
     * */
    FileSystem.prototype.createFileOrFolder = function (name, parentId, type, content) {
        var parent = this.getItem(parentId);
        if (!this.isFolder(parent)) {
            return;
        }
        var newItemName;
        var newItem;
        if (name !== undefined && name.length !== 0) {
            if (parent.findChildByName(name) !== null) {
                throw new Error("Element with such name already exists.");
            }
            newItemName = name;
        }
        else {
            var possibleName = type === 0 /* Folder */ ? "new folder" : "new file.txt";
            newItemName = this.getUniqueName(possibleName, parent);
        }
        if (type === 0 /* Folder */) {
            newItem = new folder_1.Folder(++this.lastAddedId, newItemName);
        }
        else {
            newItem = new file_1.File(++this.lastAddedId, newItemName, content);
        }
        parent.getChildren().push(newItem);
        this.saveData();
    };
    ;
    /**
     * Converts recursively the file system to a flat array.
     * @param item - item of file system. First time the function is called with root item
     * @param parent - parent item. First time the function is called with null
     * @return Array - objects of file system in the flat array
     * */
    FileSystem.prototype.toSaveFormat = function (item, parent) {
        var saveArray = [this.itemToSaveFormat(item, parent)];
        if (this.isFolder(item)) {
            var children = item.getChildren();
            for (var i = 0; i < children.length; i++) {
                var arr = this.toSaveFormat(children[i], item);
                saveArray = saveArray.concat(arr);
            }
        }
        return saveArray;
    };
    ;
    /**
     * Converts the item to object for array
     * @param item - object at the runtime format
     * @param parent - parent item of the given object
     * @return object at the save format
     * */
    FileSystem.prototype.itemToSaveFormat = function (item, parent) {
        var parentId = parent === null ? null : parent.getId();
        var element = { id: item.getId(), parent: parentId, name: item.getName(), type: item.getType() };
        if (!this.isFolder(item)) {
            element.content = item.getContent();
        }
        return element;
    };
    ;
    /**
     * Converts the object from the flat array to item.
     * @param objectInArray - object from saved array
     * @return item at the runtime format
     * */
    FileSystem.prototype.itemFromSaveFormat = function (objectInArray) {
        var type = objectInArray.type;
        if (type === 0 /* Folder */) {
            return new folder_1.Folder(objectInArray.id, objectInArray.name);
        }
        else {
            return new file_1.File(objectInArray.id, objectInArray.name, objectInArray.content);
        }
    };
    /**
     * Converts flat array to fsStorage object
     * @param arr - fsStorage as array (saved format)
     * */
    FileSystem.prototype.fromSaveFormat = function (arr) {
        //"root" always goes first in the array
        this.root = this.itemFromSaveFormat(arr[0]);
        this.lastAddedId = 0;
        for (var i = 1; i < arr.length; i++) {
            //parent is always before child in the array
            this.getItem(arr[i].parent).addChild(this.itemFromSaveFormat(arr[i]));
            if (arr[i].id > this.lastAddedId) {
                this.lastAddedId = arr[i].id;
            }
        }
    };
    /**
     * Saves the data at the save format in the localStorage.
     * */
    FileSystem.prototype.saveData = function () {
        try {
            var fsStorageAsArray = this.toSaveFormat(this.root, null);
            localStorage.setItem("saveArray", JSON.stringify(fsStorageAsArray));
        }
        catch (err) {
            alert("Error occurred while saving the data");
        }
    };
    return FileSystem;
}());
exports.fileSystem = new FileSystem();
//# sourceMappingURL=fileSystem.js.map