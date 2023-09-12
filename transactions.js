const fs = require("fs");
const JSONStream = require("JSONStream");
const { program } = require("commander");

// Constants
const ITEM_KEYS = ["name", "category", "amount"];
const LEDGER_FILE = "GeneralLedger.json";
const JSON_SPACE_INDENTATION_COUNT = 2;
const PENNIES_IN_DOLLAR = 100;
const FLOAT_RE = /^\d+.\d*$/;

// Item Object Generation Function
/**
 * @param {Object} itemArgs An object of values for an item to create, passed
 * as arguments to the script
 * @returns {Object} An item object to insert into the ledger
 */
const makeNewItem = itemArgs => {
    const newItem = {};

    ITEM_KEYS.forEach(itemKey => {
        if (itemKey == "amount") {
            if (!FLOAT_RE.test(itemArgs[itemKey])) {
                throw new TypeError("Amount value must be valid non-negative number");
            }

            // Used to clamp amount value to hundredths place
            newItem[itemKey] = Math.round(itemArgs[itemKey] * PENNIES_IN_DOLLAR) 
                / PENNIES_IN_DOLLAR;
        } else {
            newItem[itemKey] = itemArgs[itemKey];
        }
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

// Output Logging Functions
const getItemStr = item => {
    return `{ ${ITEM_KEYS
        .map(key => `${key} : ${item[key]}`)
        .join(", ")} }`;
}

// --------MAIN DRIVER--------
(async () => {
    try {
        program
            .option("-n, --name <name>", "name of item from transaction")
            .option("-c, --category <type>", "category of the item from the transaction")
            .option("-a, --amount <value>", "the amount spent on the transaction");

        program.parse(process.argv);
    
        const options = program.opts();

        for (const itemKey of ITEM_KEYS) {
            if (!options[itemKey]) {
                throw new TypeError(`Must provide value for ${itemKey}`);
            }
        }

        const newItem = makeNewItem(options);

        if (!fs.existsSync(LEDGER_FILE)) {
            initializeLedger();
        }

        addItemToLedger(newItem);

        console.log(`Added item ${getItemStr(newItem)} to ${LEDGER_FILE}`);
    } catch (error) {
        console.log(`${error.name}: ${error.message}`);
        console.log("transactions.js terminating permaturely");
    }
})();