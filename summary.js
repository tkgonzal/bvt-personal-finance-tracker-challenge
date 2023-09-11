const fs = require("fs");
const JSONStream = require("JSONStream");

// Constants
const LEDGER_FILE = "GeneralLedger.json";
const PENNIES_IN_DOLLAR = 100;
const CATEGORY_FLAGS = ["--category", "-c"];
const INTERVAL_FLAGS = ["--interval", "-i"];
const ACCEPTED_FLAGS = [...CATEGORY_FLAGS, ...INTERVAL_FLAGS];
const INTERVAL_ARG_RE = /^\d+(d|m|y)$/;
const HORIZONTAL_BREAK_DASH_COUNT = 24;

// Helper Functions
/**
 * @param {string[]} flagArgs An array of arguements passed to the script,
 * specifying the flags and values to consider when running
 * @returns {Object} A flag object to use to filter what the script returns.
 */
const getSummaryFilterFlags = flagArgs => {
    // If the args are not even (i.e. a flag does not have a corresoponding value)
    // Throws an error
    if (flagArgs.length % 2) {
        throw new TypeError("Must provide argument values for each flag");
    }

    // Each member indicates whether or not a flag is active.
    // if it is, will also have a member for the value to
    // use for that flag's function
    const flags = {
        category: false,
        categoryVal: null, // The category to filter for
        interval: false,
        intervalVal: null // The earliest date to filter from
    }

    for (let i = 0; i < flagArgs.length; i += 2) {
        if (ACCEPTED_FLAGS.includes(flagArgs[i])) {
            if (CATEGORY_FLAGS.includes(flagArgs[i])) {
                flags.category = true;
                flags.categoryVal = flagArgs[i + 1];
            } else {
                flags.interval = true;
                const intervalArgVal = flagArgs[i + 1];

                if (!INTERVAL_ARG_RE.test(intervalArgVal)) {
                    throw new TypeError("Interval value must be a whole number followed by a d, m, or y (i.e. 30d)");
                }

                flags.intervalVal = getDateToFilterFrom(intervalArgVal);
            }

        } else {
            throw new TypeError("Invalid flag given");
        }
    }

    return flags;
}

/**
 * @param {string} intervalArgVal An argument for the interval flag in the 
 * format of a number followed by a d, m, or y
 * @returns A date cutoff to use when filtering the ledger for transactions
 * within a certain timeframe
 */
const getDateToFilterFrom = (intervalArgVal) => {
    const intervalType = intervalArgVal.at(-1);
    const intervalLength = parseInt(intervalArgVal.slice(
        0, intervalArgVal.length - 1
    ));

    const timestampCutOff = new Date();

    switch (intervalType) {
        case "d":
            timestampCutOff.setDate(
                timestampCutOff.getDate() - intervalLength
            );
            break;
        case "m":
            timestampCutOff.setMonth(
                timestampCutOff.getMonth() - intervalLength
            );
            break;
        case "y":
            timestampCutOff.setFullYear(
                timestampCutOff.getFullYear() - intervalLength
            );
            break;
    }

    return timestampCutOff;
}

/**
 * Tally's a given item into the summaryStats
 * @param {Map} summaryStats A map that tracks the total amount
 * of money spect per transaction category, and stores 
 * each item per category
 * @param {Object} item A transaction item object
 */
const tallyItem = (summaryStats, flags, item) => {
    const timestampAdded = new Date(item.timestamp);

    if ((flags.category && item.category !== flags.categoryVal) ||
        (flags.interval && flags.intervalVal > timestampAdded)) {
        return;
    }

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
        console.log("-".repeat(HORIZONTAL_BREAK_DASH_COUNT));
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
    console.log("-".repeat(HORIZONTAL_BREAK_DASH_COUNT));
}

// Summary Driver
(() => {
    try {
        const flagArgs = process.argv.slice(2);
        const summaryFilterFlags = getSummaryFilterFlags(flagArgs);

        const summaryStats = new Map();

        const ledgerStream = fs.createReadStream(LEDGER_FILE, "utf-8");
    
        ledgerStream.on("error", err => { throw err });

        ledgerStream.pipe(JSONStream.parse("items.*"))
            .on("data", chunk => {
                tallyItem(summaryStats, summaryFilterFlags, chunk);
            });

        ledgerStream.on("end", () => {
            logSummary(summaryStats);
        });
    } catch (error) {
        console.log(`${error.name}: ${error.message}`);
        console.log("summary.js terminating prematurely");
    }
})();