const fs = require("fs");

const ITEM_KEYS = ["name", "category", "amount"];

// Item Object Generation Function
/**
 * @param {string[]} itemArgs An array of arguments passed to the script
 * specifying key value pairs for an item to insert into the ledger
 * @returns {Object} An item object to insert into the ledger
 */
const makeNewItem = itemArgs => {
    const newItem = {};
    
    itemArgs.forEach(arg => {
        const equalsIndex = arg.indexOf("=");
        const key = arg.slice(1, equalsIndex)
        const val = arg.slice(equalsIndex + 1);

        if (!key | !ITEM_KEYS.includes(key)) {
            throw new TypeError(`Argument key must be -name, -category, or -amount, not ${key ? `${key}`: "empty"}`);
        } 

        newItem[key] = key !== "amount" ? val : parseFloat(val);
    });

    newItem["timestamp"] = new Date();

    return newItem;
}

// --------MAIN DRIVER--------
(() => {
    try {
        const args = process.argv.slice(2);
    
        if (args.length !== 3) {
            throw new TypeError("Must provide arguments for exactly -name, -category, and -amount");
        }
    
        const newItem = makeNewItem(args);

        console.log(newItem);
    } catch (error) {
        console.log(`${error.name}: ${error.message}`);
        console.log("transactions.js terminating permaturely");
    }
})();