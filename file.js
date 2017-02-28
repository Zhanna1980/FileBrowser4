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
var File = (function (_super) {
    __extends(File, _super);
    function File(id, name, content) {
        _super.call(this, id, name, 1 /* File */);
        this.content = content;
    }
    File.prototype.setContent = function (content) {
        this.content = content;
    };
    File.prototype.getContent = function () {
        return this.content;
    };
    return File;
}(item_1.Item));
exports.File = File;
//API:
// constructor(id, name, content)
// rename(newName)
// setContent(content)
// getContent()
// getId()
// getType()
//# sourceMappingURL=file.js.map