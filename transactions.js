const fs = require("fs");
const JSONStream = require("JSONStream");

// Constants
const ITEM_KEYS = ["name", "category", "amount"];
const LEDGER_FILE = "GeneralLedger.json";
const JSON_SPACE_INDENTATION_COUNT = 2;

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

// Ledger File Functions
/**
 * Used to initialize the ledger file as an object with an empty 
 * items array member
 */
const initializeLedger = () => {
    const ledger = { items: [] };

    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger));
}

/**
 * A Promise used to load the ledger in the ledger file
 * @returns {Object} A ledger object containing an items member, which consists 
 * of item objects which contain information regarding transactions made
 */
const loadLedger = () => {
    return new Promise((resolve, reject) => {
        const ledger = { items: [] };

        const ledgerStream = fs.createReadStream(LEDGER_FILE, "utf-8");

        ledgerStream.pipe(JSONStream.parse("items.*"))
            .on("data", chunk => {
                ledger.items.push(chunk);
            });

        ledgerStream.on("error", err => reject(err));

        ledgerStream.on("end", () => resolve(ledger));
    });
}

/**
 * Adds a given item to the ledger file
 * @param {Object} item An object containing the relevant information of a 
 * transaction made
 */
const addItemToLedger = async item => {
    const ledger = await loadLedger();
    ledger.items.push(item);
    fs.writeFileSync(LEDGER_FILE, 
        JSON.stringify(ledger, null, JSON_SPACE_INDENTATION_COUNT));
}

// --------MAIN DRIVER--------
(async () => {
    try {
        const args = process.argv.slice(2);
    
        if (args.length !== 3) {
            throw new TypeError("Must provide arguments for exactly -name, -category, and -amount");
        }
    
        const newItem = makeNewItem(args);

        if (!fs.existsSync(LEDGER_FILE)) {
            initializeLedger();
        }

        addItemToLedger(newItem);
    } catch (error) {
        console.log(`${error.name}: ${error.message}`);
        console.log("transactions.js terminating permaturely");
    }
})();