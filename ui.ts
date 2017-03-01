import {fileSystem} from "./fileSystem";
import {navigationHistory} from "./history";
import * as $ from 'jquery';
import {ITEM_TYPE, Item} from "./item";
import {Folder} from "./folder";
import {File} from "./file";
/**
 * Created by zhannalibman on 28/02/2017.
 */

interface TreeState {
    [propName: string]: boolean;
}

interface MenuData {
    menuEntries: JQuery[],
    id: number
}

export class UI {

    constructor() {
        this.initializeUI();
    }

    /**
     * Initializes UI.
     * */
    private initializeUI (): void {
        navigationHistory.addToHistory(fileSystem.getItem().getId());
        this.updateUI();
        this.setupInitialEventHandlers();
    }

    /**
     * Creates folder tree display in the explorer panel,
     * displays folder or file in content panel and writes the path
     * according to current item in navigation history
     * */
    private updateUI (): void {
        this.showFolderOrFileContentById(navigationHistory.getCurrent(), true /*skipHistory*/);
        const treeState = this.getExplorerState();
        this.showFoldersTree(treeState);
    }

    /**
     * Sets some general event listeners.
     * */
    private setupInitialEventHandlers (): void {
        $('.layout').contextmenu(function () {
            return false;
        });
        $(window).click(this.hideContextMenu);
        $("#content").contextmenu(this.showContextMenu);
        $("#path").on('keydown', this.handleChangePath);
        $("#btnBack").click(this.back);
        $("#btnForward").click(this.forward);
    }

    /**
     * Handles navigating to a new path.
     * */
    private handleChangePath = (event: JQueryKeyEventObject): void => {
        //if enter was pressed
        if (event.keyCode == 13) {
            const path = $(event.currentTarget).val();
            const item = fileSystem.getItem(path);
            if (item != null) {
                this.showFolderOrFileContentById(item.getId());
            } else {
                alert ("Path not found.");
            }
        }
    };

    /**
     * Navigates back in the history.
     * */
    private back = (): void =>  {
        if (!navigationHistory.hasBack()) {
            return;
        }
        if (!this.showFolderOrFileContentById(navigationHistory.goBack(), true /*skipHistory*/)) {
            alert("Folder/file you want to open doesn't exist." +
                " The previous folder/file (if it exists) will be opened.");
            navigationHistory.deleteCurrentItemId(true /*goesBack*/);
            this.back();
        }
    };

    /**
     * Navigates forward in the history.
     * */
    private forward = (): void => {
        if (!navigationHistory.hasForward()) {
            return;
        }
        if (!this.showFolderOrFileContentById(navigationHistory.goForward(), true /*skipHistory*/)) {
            alert("Folder/file you want to open doesn't exist." +
                " The next folder/file (if it exists) will be opened.");
            navigationHistory.deleteCurrentItemId(false /*goesBack*/);
            this.forward();
        }
    };

    /**
     * Displays folder tree in the explorer.
     * @param collapsedElements - the object that represents the previous state of the tree.
     * */
    private showFoldersTree (collapsedElements: TreeState): void {
        const rootDomElement = $("#fs");
        rootDomElement.empty();
        this.showFoldersTreeRecursive(fileSystem.getItem(), rootDomElement, collapsedElements);
    }

    /**
     * Actual implementation (recursive) of showFoldersTree
     * @param item - item in the fileSystem.
     * @param parentInDOM - parent html item  to which a new entry will be appended.
     * @param collapsedElements - the object that represents the previous state of the tree.
     * */
    private showFoldersTreeRecursive (item: Item, parentInDOM: JQuery, collapsedElements?: TreeState): void {
        if (item.getType() === ITEM_TYPE.Folder) {
            const isCollapsed = collapsedElements == undefined || collapsedElements.hasOwnProperty(String(item.getId()));
            const ul = this.createFoldersListElement(item, parentInDOM, isCollapsed).find("ul");
            const children = (item as Folder).getChildren();
            for (var i = 0; i < children.length; i++) {
                this.showFoldersTreeRecursive(children[i], ul, collapsedElements);
            }
        }
    }

    /**Creates single explorer tree object and attaches it to a parent object.
     * @param item - item in fileSystem.
     * @param parentInDOM - parent object to which the newly created object is attached
     * @param isCollapsed - the state of newly created object item.
     * @return the newly created object.
     * */
    private createFoldersListElement (item: Item, parentInDOM: JQuery, isCollapsed: boolean): JQuery {
        const elementInDom = $("<li><div class='image'/>" + " " +
            "<a href='#' data-id=" + item.getId() + ">" + item.getName() + "</a></li>");
        elementInDom.appendTo(parentInDOM);
        elementInDom.addClass("folder");
        if (isCollapsed && (item as Folder).hasSubfolders()) {
            elementInDom.addClass("collapsed");
        }
        const ul = $('<ul></ul>');
        ul.appendTo(elementInDom);
        elementInDom.find("div").click(this.onFolderIconClick);
        elementInDom.find("a").click(this.onFolderNameClick);
        elementInDom.contextmenu(this.showContextMenu);
        return elementInDom;
    }

    /**
     * Handles the click on the name of the folder in the explorer.
     * */
    private onFolderNameClick = (event: JQueryMouseEventObject): void => {
        const clickedLink = $(event.currentTarget);
        if (clickedLink.closest("li").hasClass("collapsed")) {
            clickedLink.siblings('div').click();
        }
        const elementId = clickedLink.attr("data-id");
        this.showFolderOrFileContentById(parseInt(elementId));
    };

    /**
     * Handles the click on the folder icon in the explorer
     * */
    private onFolderIconClick = (event: JQueryMouseEventObject): void => {
        const clickedElement = $(event.currentTarget);
        const folderId = parseInt(clickedElement.siblings('a').attr("data-id"));
        if ((fileSystem.getItem(folderId) as Folder).hasSubfolders()) {
            clickedElement.parent().toggleClass("collapsed");
        }
    };

    /**
     * Display contents of folder in content panel
     * @param folderItem - folder to show in content panel
     * */
    private displayFolderContent (folderItem: Folder): void {
        const contentDiv = this.clearAndReturnContentDiv();
        const folderContent = folderItem.getChildren();
        for (var i = 0; i < folderContent.length; i++) {
            const itemTypeString = folderContent[i].getType() === ITEM_TYPE.Folder ? "folder" : "file";
            const contentItem = $("<div>")
                .attr("data-id",folderContent[i].getId())
                .attr("title",folderContent[i].getName())
                .attr("data-type", itemTypeString)
                .addClass("contentItem")
                .contextmenu(this.showContextMenu)
                .click(this.onContentItemClick)
                .append($("<div>").html(folderContent[i].getName()))
                .prepend("<img src='_images/"+itemTypeString+".png'/>");
            contentDiv.append(contentItem);
        }
    }

    /**
     * Handles click on item in content panel
     * */
    private onContentItemClick = (event): void => {
        const elementId = $(event.currentTarget).attr("data-id");
        this.showFolderOrFileContentById(parseInt(elementId));
    };

    /**
     * Displays file content in content panel
     * @param fileItem - file object from file system
     * */
    private openFile (fileItem: File): void{
        const displayFileTemplate = `<div class="fileDisplay">
                                    <textarea class="editFile" value="" autofocus/>
                                    <div class="editFileButtonsLayer">
                                        <button class="cancel">Cancel</button>
                                        <button class="save">Save</button>
                                    </div>
                                </div>`;
        const displayFile = $(displayFileTemplate);
        const contentDiv = this.clearAndReturnContentDiv();
        contentDiv.append(displayFile);
        const displayFileTextArea = displayFile.find(".editFile");
        displayFile.find(".cancel")
            .attr("data-id", fileItem.getId())
            .click(this.closeDisplayFile);
        displayFile.find(".save")
            .attr("data-id", fileItem.getId())
            .click(this.saveChangesInFile);
        const content = fileItem.getContent();
        if (content != undefined && content != null) {
            displayFileTextArea.text(content);
        }
    }

    /**
     * Handles save button click in file editing. Saves changes to file content.
     */
    private saveChangesInFile = (event: JQueryMouseEventObject): void => {
        const fileId = parseInt($(event.currentTarget).attr("data-id"));
        const editedText = $("textarea.editFile").val();
        const file = fileSystem.getItem(fileId);
        (file as File).setContent(editedText);
        this.closeDisplayFile();
    };


    /**
     * Handles cancel button click in file editing. Discards changes to file content.
     */
    private closeDisplayFile = (): void => {
        const previousId = navigationHistory.getPrevious();
        if (previousId != undefined) {
            this.showFolderOrFileContentById(previousId);
        }
    };

    /**
     * Helper function that clears content panel and returns it's div item
     * @return {*|HTMLElement}
     */
    private clearAndReturnContentDiv (): JQuery {
        const contentDiv = $("#content");
        contentDiv.empty();
        return contentDiv;
    }

    /**
     * Shows context menu according to event
     * @param event - mouse click event
     */
    private showContextMenu = (event: JQueryMouseEventObject): boolean => {
        const menuData = this.getMenuDataForTarget($(event.currentTarget));
        if(menuData === undefined) {
            return false;
        }
        const menu = $(".menu");
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
     * Sets items of the context menu according to its target.
     * @param target - the item on which was the right click.
     * @return object with menu entries and the id of the item in the file system
     * to which the changes will be applied.
     * */
    private getMenuDataForTarget (target: JQuery): MenuData{
        if (target.is("li")) {
            return this.getMenuDataForTree(target);
        } else if (target.is("#content")) {
            return this.getMenuDataForContent(target);
        } else if (target.is(".contentItem")) {
            return this.getMenuDataForContentItem(target);
        }
    }

    /**
     * Gets data for context menu for content items.
     * @param target - the item on which was the right click.
     * @return object with menu entries and the id of the item in the file system
     * to which the changes will be applied.
     * */
    private getMenuDataForContentItem(target: JQuery) : MenuData {
        let id = parseInt(target.attr('data-id'));
        const type = $(target).attr("data-type");
        let menuEntries = [];
        if (type == "folder") {
            menuEntries = [this.menuItemNewFolder, this.menuItemNewFile];
        }
        menuEntries.push(this.menuItemDeleteFileOrFolder);
        menuEntries.push(this.menuItemRename);
        return {id, menuEntries};
    }

    /**
     * Gets data for context menu for tree "li" elements.
     * @param target - the item on which was the right click.
     * @return object with menu entries and the id of the item in the file system
     * to which the changes will be applied.
     * */
    private getMenuDataForTree (target: JQuery): MenuData {
        let id = parseInt(target.children('a').attr('data-id'));
        let menuEntries = [this.menuItemNewFolder, this.menuItemRename];
        if (id > 0) {
            menuEntries.push(this.menuItemDeleteFileOrFolder);
        }
        return {id, menuEntries};
    }

    /**
     * Gets data for context menu for content "div".
     * @param target - the item on which was the right click.
     * @return object with menu entries and the id of the item in the file system
     * to which the changes will be applied.
     * */
    private getMenuDataForContent (target: JQuery): MenuData {
        // no right click in content when file is opened
        if ($(".fileDisplay").length !== 0) {
            return;
        }
        return {
            id: navigationHistory.getCurrent(),
            menuEntries: [this.menuItemNewFolder, this.menuItemNewFile]
        };
    }

    /**
     * Hides context menu
     */
    private hideContextMenu (): void {
        $('.menu').hide();
    }

    /**
     * Handles rename item context menu entry
     * */
    private renameElement = (event: JQueryMouseEventObject): void => {
        const id = parseInt($(event.currentTarget).parent().attr("data-id"));
        const item = fileSystem.getItem(id);
        const editedItemName = prompt("Please enter the  new name", item.getName());
        if (editedItemName == undefined) {
            return;
        }
        try {
            fileSystem.renameItem(id, editedItemName);
        } catch (err) {
            alert(err.message);
        }
        this.updateUI();
    };

    /**
     * Handles delete item context menu entry
     */
    private deleteElement = (event: JQueryMouseEventObject): void => {
        const id = parseInt($(event.currentTarget).parent().attr("data-id"));
        if (id == 0) {
            alert("Root can not be deleted.");
            return;
        }
        const userConfirmed = confirm("Are you sure?");
        if (userConfirmed) {
            fileSystem.deleteItem(id);
            if (id == navigationHistory.getCurrent()) {
                navigationHistory.goBack();
            }
            this.updateUI();
        }
    };

    /**
    * Handles create new file context menu entry
    */
    private createNewFile = (event: JQueryMouseEventObject): void => {
        const id = parseInt($(event.currentTarget).parent().attr("data-id"));
        fileSystem.addFile("", id, "");
        this.updateUI();
    };

    /**
     * Handles create new folder context menu entry
     */
    private createNewFolder = (event: JQueryMouseEventObject): void => {
        const id = parseInt($(event.currentTarget).parent().attr("data-id"));
        fileSystem.addFolder("", id);
        this.updateUI();
    };

    /**
     * Returns object that represents current expand/collapse state of explorer tree
     */
    private getExplorerState (): TreeState {
        const treeEntries = $("li.folder");
        if(treeEntries.length == 0){
            return undefined;
        }
        const collapsed = $(".collapsed");
        const ids = {};
        collapsed.each(function () {
            var id = $(this).children('a').attr("data-id");
            ids[id] = true;
        });
        return ids;
    }

    /**
     * Updates current path in UI
     * @param itemId - Number
     */
    private displayPath (itemId: number): void {
        const path = fileSystem.getPath(itemId);
        const inputPath = $("#path");
        inputPath.val(path);
    }

    /**
     * Shows item in content panel, optionally adds it to history and updates path
     * @param itemId - item id
     * @param skipHistory - if true, does not add item to history.
     * @return boolean - returns true on success, false otherwise.
     */
    private showFolderOrFileContentById (itemId: number, skipHistory?: boolean): boolean {
        if (!skipHistory && navigationHistory.getCurrent() == itemId) {
            return true;
        }
        const item = fileSystem.getItem(itemId);
        if (item == null) {
            return false;
        }
        if (item.getType() === ITEM_TYPE.Folder) {
            this.displayFolderContent(item as Folder);
        } else {
            this.openFile(item as File);
        }
        if (!skipHistory) {
            navigationHistory.addToHistory(itemId);
        }
        this.displayPath(itemId);
        return true;
    }


    private readonly menuItemNewFolder = $("<div class='menuItem'>New folder</div>").click(this.createNewFolder);
    private readonly menuItemNewFile = $("<div class='menuItem'>New file</div>").click(this.createNewFile);
    private readonly menuItemDeleteFileOrFolder = $("<div class='menuItem'>Delete</div>").click(this.deleteElement);
    private readonly menuItemRename = $("<div class='menuItem'>Rename</div>").click(this.renameElement);

    //API:
    // constructor(fileSystem, history)
}





