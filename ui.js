"use strict";
var fileSystem_1 = require("./fileSystem");
var history_1 = require("./history");
var $ = require('jquery');
var UI = (function () {
    function UI() {
        var _this = this;
        /**
         * Handles navigating to a new path.
         * */
        this.handleChangePath = function (event) {
            //if enter was pressed
            if (event.keyCode == 13) {
                var path = $(event.currentTarget).val();
                var item = fileSystem_1.fileSystem.getItem(path);
                if (item != null) {
                    _this.showFolderOrFileContentById(item.getId());
                }
                else {
                    alert("Path not found.");
                }
            }
        };
        /**
         * Navigates back in the history.
         * */
        this.back = function () {
            if (!history_1.navigationHistory.hasBack()) {
                return;
            }
            if (!_this.showFolderOrFileContentById(history_1.navigationHistory.goBack(), true /*skipHistory*/)) {
                alert("Folder/file you want to open doesn't exist." +
                    " The previous folder/file (if it exists) will be opened.");
                history_1.navigationHistory.deleteCurrentItemId(true /*goesBack*/);
                _this.back();
            }
        };
        /**
         * Navigates forward in the history.
         * */
        this.forward = function () {
            if (!history_1.navigationHistory.hasForward()) {
                return;
            }
            if (!_this.showFolderOrFileContentById(history_1.navigationHistory.goForward(), true /*skipHistory*/)) {
                alert("Folder/file you want to open doesn't exist." +
                    " The next folder/file (if it exists) will be opened.");
                history_1.navigationHistory.deleteCurrentItemId(false /*goesBack*/);
                _this.forward();
            }
        };
        /**
         * Handles the click on the name of the folder in the explorer.
         * */
        this.onFolderNameClick = function (event) {
            var clickedLink = $(event.currentTarget);
            if (clickedLink.closest("li").hasClass("collapsed")) {
                clickedLink.siblings('div').click();
            }
            var elementId = clickedLink.attr("data-id");
            _this.showFolderOrFileContentById(parseInt(elementId));
        };
        /**
         * Handles the click on the folder icon in the explorer
         * */
        this.onFolderIconClick = function (event) {
            var clickedElement = $(event.currentTarget);
            var folderId = parseInt(clickedElement.siblings('a').attr("data-id"));
            if (fileSystem_1.fileSystem.getItem(folderId).hasSubfolders()) {
                clickedElement.parent().toggleClass("collapsed");
            }
        };
        /**
         * Handles click on item in content panel
         * */
        this.onContentItemClick = function (event) {
            var elementId = $(event.currentTarget).attr("data-id");
            _this.showFolderOrFileContentById(parseInt(elementId));
        };
        /**
         * Handles save button click in file editing. Saves changes to file content.
         */
        this.saveChangesInFile = function (event) {
            var fileId = parseInt($(event.currentTarget).attr("data-id"));
            var editedText = $("textarea.editFile").val();
            var file = fileSystem_1.fileSystem.getItem(fileId);
            file.setContent(editedText);
            _this.closeDisplayFile();
        };
        /**
         * Handles cancel button click in file editing. Discards changes to file content.
         */
        this.closeDisplayFile = function () {
            var previousId = history_1.navigationHistory.getPrevious();
            if (previousId != undefined) {
                _this.showFolderOrFileContentById(previousId);
            }
        };
        /**
         * Shows context menu according to event
         * @param event - mouse click event
         */
        this.showContextMenu = function (event) {
            var menuData = _this.getMenuDataForTarget($(event.currentTarget));
            if (menuData === undefined) {
                return false;
            }
            var menu = $(".menu");
            menu.empty();
            for (var i = 0; i < menuData.menuEntries.length; i++) {
                menu.append(menuData.menuEntries[i].clone(true));
            }
            menu.css('left', event.pageX + 'px');
            menu.css('top', event.pageY + 'px');
            menu.attr("data-id", menuData.id).show();
            return false;
        };
        /**
         * Handles rename item context menu entry
         * */
        this.renameElement = function (event) {
            var id = parseInt($(event.currentTarget).parent().attr("data-id"));
            var item = fileSystem_1.fileSystem.getItem(id);
            var editedItemName = prompt("Please enter the  new name", item.getName());
            if (editedItemName == undefined) {
                return;
            }
            try {
                fileSystem_1.fileSystem.renameItem(id, editedItemName);
            }
            catch (err) {
                alert(err.message);
            }
            _this.updateUI();
        };
        /**
         * Handles delete item context menu entry
         */
        this.deleteElement = function (event) {
            var id = parseInt($(event.currentTarget).parent().attr("data-id"));
            if (id == 0) {
                alert("Root can not be deleted.");
                return;
            }
            var userConfirmed = confirm("Are you sure?");
            if (userConfirmed) {
                fileSystem_1.fileSystem.deleteItem(id);
                if (id == history_1.navigationHistory.getCurrent()) {
                    history_1.navigationHistory.goBack();
                }
                _this.updateUI();
            }
        };
        /**
        * Handles create new file context menu entry
        */
        this.createNewFile = function (event) {
            var id = parseInt($(event.currentTarget).parent().attr("data-id"));
            fileSystem_1.fileSystem.addFile("", id, "");
            _this.updateUI();
        };
        /**
         * Handles create new folder context menu entry
         */
        this.createNewFolder = function (event) {
            var id = parseInt($(event.currentTarget).parent().attr("data-id"));
            fileSystem_1.fileSystem.addFolder("", id);
            _this.updateUI();
        };
        this.menuItemNewFolder = $("<div class='menuItem'>New folder</div>").click(this.createNewFolder);
        this.menuItemNewFile = $("<div class='menuItem'>New file</div>").click(this.createNewFile);
        this.menuItemDeleteFileOrFolder = $("<div class='menuItem'>Delete</div>").click(this.deleteElement);
        this.menuItemRename = $("<div class='menuItem'>Rename</div>").click(this.renameElement);
        this.initializeUI();
    }
    /**
     * Initializes UI.
     * */
    UI.prototype.initializeUI = function () {
        history_1.navigationHistory.addToHistory(fileSystem_1.fileSystem.getItem().getId());
        this.updateUI();
        this.setupInitialEventHandlers();
    };
    /**
     * Creates folder tree display in the explorer panel,
     * displays folder or file in content panel and writes the path
     * according to current item in navigation history
     * */
    UI.prototype.updateUI = function () {
        this.showFolderOrFileContentById(history_1.navigationHistory.getCurrent(), true /*skipHistory*/);
        var treeState = this.getExplorerState();
        this.showFoldersTree(treeState);
    };
    /**
     * Sets some general event listeners.
     * */
    UI.prototype.setupInitialEventHandlers = function () {
        $('.layout').contextmenu(function () {
            return false;
        });
        $(window).click(this.hideContextMenu);
        $("#content").contextmenu(this.showContextMenu);
        $("#path").on('keydown', this.handleChangePath);
        $("#btnBack").click(this.back);
        $("#btnForward").click(this.forward);
    };
    /**
     * Displays folder tree in the explorer.
     * @param collapsedElements - the object that represents the previous state of the tree.
     * */
    UI.prototype.showFoldersTree = function (collapsedElements) {
        var rootDomElement = $("#fs");
        rootDomElement.empty();
        this.showFoldersTreeRecursive(fileSystem_1.fileSystem.getItem(), rootDomElement, collapsedElements);
    };
    /**
     * Actual implementation (recursive) of showFoldersTree
     * @param item - item in the fileSystem.
     * @param parentInDOM - parent html item  to which a new entry will be appended.
     * @param collapsedElements - the object that represents the previous state of the tree.
     * */
    UI.prototype.showFoldersTreeRecursive = function (item, parentInDOM, collapsedElements) {
        if (item.getType() === 0 /* Folder */) {
            var isCollapsed = collapsedElements == undefined || collapsedElements.hasOwnProperty(String(item.getId()));
            var ul = this.createFoldersListElement(item, parentInDOM, isCollapsed).find("ul");
            var children = item.getChildren();
            for (var i = 0; i < children.length; i++) {
                this.showFoldersTreeRecursive(children[i], ul, collapsedElements);
            }
        }
    };
    /**Creates single explorer tree object and attaches it to a parent object.
     * @param item - item in fileSystem.
     * @param parentInDOM - parent object to which the newly created object is attached
     * @param isCollapsed - the state of newly created object item.
     * @return the newly created object.
     * */
    UI.prototype.createFoldersListElement = function (item, parentInDOM, isCollapsed) {
        var elementInDom = $("<li><div class='image'/>" + " " +
            "<a href='#' data-id=" + item.getId() + ">" + item.getName() + "</a></li>");
        elementInDom.appendTo(parentInDOM);
        elementInDom.addClass("folder");
        if (isCollapsed && item.hasSubfolders()) {
            elementInDom.addClass("collapsed");
        }
        var ul = $('<ul></ul>');
        ul.appendTo(elementInDom);
        elementInDom.find("div").click(this.onFolderIconClick);
        elementInDom.find("a").click(this.onFolderNameClick);
        elementInDom.contextmenu(this.showContextMenu);
        return elementInDom;
    };
    /**
     * Display contents of folder in content panel
     * @param folderItem - folder to show in content panel
     * */
    UI.prototype.displayFolderContent = function (folderItem) {
        var contentDiv = this.clearAndReturnContentDiv();
        var folderContent = folderItem.getChildren();
        for (var i = 0; i < folderContent.length; i++) {
            var imageName = folderContent[i].getType() === 0 /* Folder */ ? "folder" : "file";
            var contentItem = $("<div>")
                .attr("data-id", folderContent[i].getId())
                .attr("title", folderContent[i].getName())
                .attr("data-type", folderContent[i].getType())
                .addClass("contentItem")
                .contextmenu(this.showContextMenu)
                .click(this.onContentItemClick)
                .append($("<div>").html(folderContent[i].getName()))
                .prepend("<img src='_images/" + imageName + ".png'/>");
            contentDiv.append(contentItem);
        }
    };
    /**
     * Displays file content in content panel
     * @param fileItem - file object from file system
     * */
    UI.prototype.openFile = function (fileItem) {
        var displayFileTemplate = "<div class=\"fileDisplay\">\n                                    <textarea class=\"editFile\" value=\"\" autofocus/>\n                                    <div class=\"editFileButtonsLayer\">\n                                        <button class=\"cancel\">Cancel</button>\n                                        <button class=\"save\">Save</button>\n                                    </div>\n                                </div>";
        var displayFile = $(displayFileTemplate);
        var contentDiv = this.clearAndReturnContentDiv();
        contentDiv.append(displayFile);
        var displayFileTextArea = displayFile.find(".editFile");
        displayFile.find(".cancel")
            .attr("data-id", fileItem.getId())
            .click(this.closeDisplayFile);
        displayFile.find(".save")
            .attr("data-id", fileItem.getId())
            .click(this.saveChangesInFile);
        var content = fileItem.getContent();
        if (content != undefined && content != null) {
            displayFileTextArea.text(content);
        }
    };
    /**
     * Helper function that clears content panel and returns it's div item
     * @return {*|HTMLElement}
     */
    UI.prototype.clearAndReturnContentDiv = function () {
        var contentDiv = $("#content");
        contentDiv.empty();
        return contentDiv;
    };
    /**
     * Sets items of the context menu according to its target.
     * @param target - the item on which was the right click.
     * @return object with menu entries and the id of the item in the file system
     * to which the changes will be applied.
     * */
    UI.prototype.getMenuDataForTarget = function (target) {
        if (target.is("li")) {
            return this.getMenuDataForTree(target);
        }
        else if (target.is("#content")) {
            return this.getMenuDataForContent(target);
        }
        else if (target.is(".contentItem")) {
            return this.getMenuDataForContentItem(target);
        }
    };
    /**
     * Gets data for context menu for content items.
     * @param target - the item on which was the right click.
     * @return object with menu entries and the id of the item in the file system
     * to which the changes will be applied.
     * */
    UI.prototype.getMenuDataForContentItem = function (target) {
        var id = parseInt(target.attr('data-id'));
        var type = parseInt($(target).attr("data-type"));
        var menuEntries = [];
        if (type == 0 /* Folder */) {
            menuEntries = [this.menuItemNewFolder, this.menuItemNewFile];
        }
        menuEntries.push(this.menuItemDeleteFileOrFolder);
        menuEntries.push(this.menuItemRename);
        return { id: id, menuEntries: menuEntries };
    };
    /**
     * Gets data for context menu for tree "li" elements.
     * @param target - the item on which was the right click.
     * @return object with menu entries and the id of the item in the file system
     * to which the changes will be applied.
     * */
    UI.prototype.getMenuDataForTree = function (target) {
        var id = parseInt(target.children('a').attr('data-id'));
        var menuEntries = [this.menuItemNewFolder, this.menuItemRename];
        if (id > 0) {
            menuEntries.push(this.menuItemDeleteFileOrFolder);
        }
        return { id: id, menuEntries: menuEntries };
    };
    /**
     * Gets data for context menu for content "div".
     * @param target - the item on which was the right click.
     * @return object with menu entries and the id of the item in the file system
     * to which the changes will be applied.
     * */
    UI.prototype.getMenuDataForContent = function (target) {
        // no right click in content when file is opened
        if ($(".fileDisplay").length !== 0) {
            return;
        }
        return {
            id: history_1.navigationHistory.getCurrent(),
            menuEntries: [this.menuItemNewFolder, this.menuItemNewFile]
        };
    };
    /**
     * Hides context menu
     */
    UI.prototype.hideContextMenu = function () {
        $('.menu').hide();
    };
    /**
     * Returns object that represents current expand/collapse state of explorer tree
     */
    UI.prototype.getExplorerState = function () {
        var treeEntries = $("li.folder");
        if (treeEntries.length == 0) {
            return undefined;
        }
        var collapsed = $(".collapsed");
        var ids = {};
        collapsed.each(function () {
            var id = $(this).children('a').attr("data-id");
            ids[id] = true;
        });
        return ids;
    };
    /**
     * Updates current path in UI
     * @param itemId - Number
     */
    UI.prototype.displayPath = function (itemId) {
        var path = fileSystem_1.fileSystem.getPath(itemId);
        var inputPath = $("#path");
        inputPath.val(path);
    };
    /**
     * Shows item in content panel, optionally adds it to history and updates path
     * @param itemId - item id
     * @param skipHistory - if true, does not add item to history.
     * @return boolean - returns true on success, false otherwise.
     */
    UI.prototype.showFolderOrFileContentById = function (itemId, skipHistory) {
        if (!skipHistory && history_1.navigationHistory.getCurrent() == itemId) {
            return true;
        }
        var item = fileSystem_1.fileSystem.getItem(itemId);
        if (item == null) {
            return false;
        }
        if (item.getType() === 0 /* Folder */) {
            this.displayFolderContent(item);
        }
        else {
            this.openFile(item);
        }
        if (!skipHistory) {
            history_1.navigationHistory.addToHistory(itemId);
        }
        this.displayPath(itemId);
        return true;
    };
    return UI;
}());
exports.UI = UI;
//# sourceMappingURL=ui.js.map