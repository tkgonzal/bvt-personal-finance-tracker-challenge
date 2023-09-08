const fs = require("fs");
const JSONStream = require("JSONStream");

// Constants
const LEDGER_FILE = "GeneralLedger.json";
const PENNIES_IN_DOLLAR = 100;

// Helper Functions
/**
 * Tally's a given item into the summaryStats
 * @param {Map} summaryStats A map that tracks the total amount
 * of money spect per transaction category, and stores 
 * each item per category
 * @param {Object} item A transaction item object
 */
const tallyItem = (summaryStats, item) => {
    if (!summaryStats.has(item.category)) {
        summaryStats.set(item.category, {
            totalSpent: 0,
            items: []
        });
    }

    const categoryStats = summaryStats.get(item.category);
    categoryStats.totalSpent += item.amount * PENNIES_IN_DOLLAR;
    categoryStats.items.push(item);
}

/**
 * Logs the relevant information from summaryStats, including the 
 * items tracked and the breakdown of money spent per category tracked
 * @param {Map} summaryStats A map that tracks the total amount
 * of money spect per transaction category, and stores 
 * each item per category
 */
const logSummary = summaryStats => {
    summaryStats.forEach((categoryStat, category) => {
        const totalSpentString = (categoryStat.totalSpent / PENNIES_IN_DOLLAR)
            .toFixed(2);
        
        console.log(`${category} - $${totalSpentString}`);
        console.log("-".repeat(24));
        categoryStat.items.forEach(logItem);
        console.log();
    });
}

/**
 * Logs the information of an item from a transaction 
 * @param {Object} item An item from a transaction
 */
const logItem = item => {
    const timestampAdded = new Date(item.timestamp);

    console.log(`-${item.name}`);
    console.log(`  category: ${item.category}`);
    console.log(`  amount: $${item.amount.toFixed(2)}`);
    console.log(`  timestamp added: ${timestampAdded.toLocaleString()}`);
    console.log("-".repeat(24));
    
}

// Summary Driver
(() => {
    try {
        const summaryStats = new Map();

        const ledgerStream = fs.createReadStream(LEDGER_FILE, "utf-8");
    
        ledgerStream.on("error", err => { throw err });

        ledgerStream.pipe(JSONStream.parse("items.*"))
            .on("data", chunk => {
                tallyItem(summaryStats, chunk);
            });

        ledgerStream.on("end", () => {
            logSummary(summaryStats);
        });
    } catch (error) {
        console.log(`${error.name}: ${error.message}`);
        console.log("summary.js terminating prematurely");
    }
})();