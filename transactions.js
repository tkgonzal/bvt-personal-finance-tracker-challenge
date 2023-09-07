const fs = require("fs");

// --------MAIN DRIVER--------
(() => {
    try {
        const args = process.argv.slice(2);
    
        if (args.length !== 3) {
            throw new TypeError("Must provide arguments for exactly -name, -category, and -amount");
        }
    
        const newItem = {};
    
        args.forEach(arg => {
            const equalsIndex = arg.indexOf("=");
            const key = arg.slice(1, equalsIndex)
            const val = arg.slice(equalsIndex + 1);

            if (!key | !["name", "category", "amount"].includes(key)) {
                throw new TypeError(`Argument key must be -name, -category, or -amount, not ${key ? `${key}`: "empty"}`);
            } 

            newItem[key] = key !== "amount" ? val : parseFloat(val);
        });

        newItem["timestamp"] = new Date();

        console.log(newItem);
    } catch (error) {
        console.log(`${error.name}: ${error.message}`);
        console.log("transactions.js terminating permaturely");
    }
})();