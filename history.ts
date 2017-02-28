/**
 * Created by zhannalibman on 28/02/2017.
 */

class History {
    history: number[];
    currentItemIndex: number;

    constructor () {
        this.history = [];
        this.currentItemIndex = -1;
    }

    /**
     * Moves one entry back in history
     * */
    goBack (): number {
        if (this.hasBack()) {
            --this.currentItemIndex;
        }
        return this.getCurrent();
    }

    /**
     * Moves one entry forward in history
     * */
    goForward (): number {
        if (this.hasForward()) {
            ++this.currentItemIndex;
        }
        return this.getCurrent();
    }

    /**
     * Adds item id to history
     */
    addToHistory (id: number): void {
        if(this.currentItemIndex > -1 && this.getCurrent() == id) {
            return;
        }
        this.history.splice(++this.currentItemIndex, 0, id);
        this.history.splice(this.currentItemIndex + 1);
    }

    /**
     * Gets current item's id.
     * @return current item's id or undefined if the history is empty.
     * */
    getCurrent (): number {
        if (this.currentItemIndex > -1 && this.currentItemIndex < this.history.length) {
            return this.history[this.currentItemIndex];
        } else {
            return undefined;
        }
    }

    /**
     * Return true if there is history back from current item
     * */
    hasBack (): boolean {
        return this.currentItemIndex > 0;
    }

    /**
     * Return true if there is history forward from current item
     */
    hasForward (): boolean {
        return this.currentItemIndex < this.history.length - 1;
    }

    /**
     * Removes from the history id at current index.
     * @param goesBack - Boolean which determines how to change the current index after removing.
     * */
    deleteCurrentItemId (goesBack: boolean): void {
        this.history.splice(this.currentItemIndex, 1);
        if (!goesBack){
            this.currentItemIndex--;
        }
    }

    /**
     * Returns previous item id in history if exists
     * @return previous item id in history if exists or undefined
     * */
    getPrevious (): number {
        if (this.hasBack()) {
            return this.history[this.currentItemIndex - 1];
        }
    };

    //API:
    // constructor()
    // goBack()
    // goForward()
    // addToHistory(id)
}

export const navigationHistory = new History();




