/**
 * Created by zhannalibman on 25/02/2017.
 */
"use strict";
var Item = (function () {
    function Item(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
    Item.prototype.rename = function (newName) {
        this.name = newName;
    };
    Item.prototype.getName = function () {
        return this.name;
    };
    Item.prototype.getId = function () {
        return this.id;
    };
    Item.prototype.getType = function () {
        return this.type;
    };
    return Item;
}());
exports.Item = Item;
//# sourceMappingURL=item.js.map