const fs = require("fs");
const JSONStream = require("JSONStream");
const { program } = require("commander");

// Constants
const LEDGER_FILE = "GeneralLedger.json";
const PENNIES_IN_DOLLAR = 100;
const INTERVAL_ARG_RE = /^\d+(d|m|y)$/;
const HORIZONTAL_BREAK_DASH_COUNT = 24;

// Helper Functions
/**
 * @param {Object} options An object of option args passed to the program. 
 * Will be parsed to determine which flags to use when filtering.
 * @returns {Object} A flag object to use to filter what the summary script
 * outputs.
 */
const getSummaryFilterFlags = options => {
    // Creates a flags object based on the options objec. Only meaningful
    // difference is that if an interval is passed, the interval will be
    // converted from the passed string to a Date object
    const flags = {
        category: options["category"],
        interval: null
    }

    if (options.interval) {
        if (!INTERVAL_ARG_RE.test(options.interval)) {
            throw new TypeError("Interval value must be a whole number followed by a d, m, or y");
        }

        flags.interval = getDateToFilterFrom(options.interval);
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
 * @param {Object} flags An object used to filter which items get tallied.
 * If a given item doesn't match the flags, the function will return
 * prematurely.
 * @param {Object} item A transaction item object
 */
const tallyItem = (summaryStats, flags, item) => {
    const timestampAdded = new Date(item.timestamp);

    if ((flags.category && item.category !== flags.category) ||
        (flags.interval && flags.interval > timestampAdded)) {
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
 * @param {Object} options An options object specifying what arguments
 * were passed to the script. Used for empty summary logging.
 */
const logSummary = (summaryStats, options) => {
    if (summaryStats.size === 0) {
        const optionStrs = Object.keys(options)
            .filter(option => options[option])
            .map(option => `${option} of ${options[option]}`);
        console.log(`No transactions found for ${optionStrs.join(", ")}`);
        return;
    }

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
        program
            .option("-c, --category <type>", "category of item transaction")
            .option("-i, --interval <length>", "time interval to filter from");
        
        program.parse(process.argv);
        const summaryFilterFlags = getSummaryFilterFlags(program.opts());

        const summaryStats = new Map();

        const ledgerStream = fs.createReadStream(LEDGER_FILE, "utf-8");
    
        ledgerStream.on("error", err => { throw err });

        ledgerStream.pipe(JSONStream.parse("items.*"))
            .on("data", chunk => {
                tallyItem(summaryStats, summaryFilterFlags, chunk);
            });

        ledgerStream.on("end", () => {
            logSummary(summaryStats, program.opts());
        });
    } catch (error) {
        console.log(`${error.name}: ${error.message}`);
        console.log("summary.js terminating prematurely");
    }
})();