"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var item_1 = require("./item");
/**
 * Created by zhannalibman on 26/02/2017.
 */
var Folder = (function (_super) {
    __extends(Folder, _super);
    function Folder(id, name) {
        _super.call(this, id, name, 0 /* Folder */);
        this.children = [];
    }
    /**
     * Deletes the child with given id.
     * @param id - the id of the child item.
     * */
    Folder.prototype.deleteChild = function (id) {
        var index = this.findChildIndexById(id);
        if (index != -1) {
            this.children.splice(index, 1);
        }
    };
    /**
     * Returns the index of the child item in the array of subitems
     * @param id - child item id
     * @return index of the item in the children array or -1 if not found.
     * */
    Folder.prototype.findChildIndexById = function (id) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].getId() == id) {
                return i;
            }
        }
        return -1;
    };
    /**
     * Pushes a new item to the array of subitems.
     * */
    Folder.prototype.addChild = function (item) {
        this.children.push(item);
        this.sortContent();
    };
    /**
     * Sorts by folder/file and alphabetically.
     * @return Array, sorted by folder/file and alphabetically.
     * */
    Folder.prototype.sortContent = function () {
        this.children = this.children.sort(function (a, b) {
            //if both file or folder
            if (a.getType() == b.getType()) {
                return (a.getName()).localeCompare(b.getName());
            }
            return a.getType() === 0 /* Folder */ ? -1 : 1;
        });
    };
    /**
     * Returns child with the specified id.
     * @param id - the id of the child.
     * @return child item with given id or null if not found.
     * */
    Folder.prototype.findChild = function (id) {
        var index = this.findChildIndexById(id);
        if (index == -1) {
            return null;
        }
        return this.children[index];
    };
    /**
     //  * Renames child item with given id.
     //  * @param newName - a new name.
     //  * @param childId - the id of the child item to be renamed.
     //  * */
    Folder.prototype.renameChild = function (newName, childId) {
        if (this.findChildByName(newName) == null) {
            this.findChild(childId).rename(newName);
            this.sortContent();
        }
        else {
            throw new Error("Element with such name already exists.");
        }
    };
    /**
      * Searches for a child item with a given name.
      * @param childName - String, the name of the item that is searched for .
      * @return childItem or null if folder doesn't contain child item with the given name.
      **/
    Folder.prototype.findChildByName = function (childName) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].getName() === childName) {
                return this.children[i];
            }
        }
        return null;
    };
    ;
    /**Returns the array of children.
     * @return Array of subitems.
     * */
    Folder.prototype.getChildren = function () {
        return this.children;
    };
    /**
     * Checks if given folder has subfolders.
     * @return Boolean: true if it has subfolders and false if it has not.
     * */
    Folder.prototype.hasSubfolders = function () {
        var children = this.getChildren();
        for (var i = 0; i < children.length; i++) {
            if (children[i].getType() === 0 /* Folder */) {
                return true;
            }
        }
        return false;
    };
    return Folder;
}(item_1.Item));
exports.Folder = Folder;
// API:
// constructor(id, name)
// deleteChild(id)
// rename(newName)
// addChild(Folder | File)
// findChild(id)
// getChildren()
// getId()
// getType()
//# sourceMappingURL=folder.js.map