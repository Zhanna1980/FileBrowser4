/**
 * Created by zhannalibman on 28/02/2017.
 */
"use strict";
var History = (function () {
    function History() {
        this.history = [];
        this.currentItemIndex = -1;
    }
    /**
     * Moves one entry back in history
     * */
    History.prototype.goBack = function () {
        if (this.hasBack()) {
            --this.currentItemIndex;
        }
        return this.getCurrent();
    };
    /**
     * Moves one entry forward in history
     * */
    History.prototype.goForward = function () {
        if (this.hasForward()) {
            ++this.currentItemIndex;
        }
        return this.getCurrent();
    };
    /**
     * Adds item id to history
     */
    History.prototype.addToHistory = function (id) {
        if (this.currentItemIndex > -1 && this.getCurrent() == id) {
            return;
        }
        this.history.splice(++this.currentItemIndex, 0, id);
        this.history.splice(this.currentItemIndex + 1);
    };
    /**
     * Gets current item's id.
     * @return current item's id or undefined if the history is empty.
     * */
    History.prototype.getCurrent = function () {
        if (this.currentItemIndex > -1 && this.currentItemIndex < this.history.length) {
            return this.history[this.currentItemIndex];
        }
        else {
            return undefined;
        }
    };
    /**
     * Return true if there is history back from current item
     * */
    History.prototype.hasBack = function () {
        return this.currentItemIndex > 0;
    };
    /**
     * Return true if there is history forward from current item
     */
    History.prototype.hasForward = function () {
        return this.currentItemIndex < this.history.length - 1;
    };
    /**
     * Removes from the history id at current index.
     * @param goesBack - Boolean which determines how to change the current index after removing.
     * */
    History.prototype.deleteCurrentItemId = function (goesBack) {
        this.history.splice(this.currentItemIndex, 1);
        if (!goesBack) {
            this.currentItemIndex--;
        }
    };
    /**
     * Returns previous item id in history if exists
     * @return previous item id in history if exists or undefined
     * */
    History.prototype.getPrevious = function () {
        if (this.hasBack()) {
            return this.history[this.currentItemIndex - 1];
        }
    };
    ;
    return History;
}());
exports.navigationHistory = new History();
//# sourceMappingURL=history.js.map