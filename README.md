# Personal Finance Tracker Coding Challenge
A coding challenge from Bay Valley Tech given on 9/7/2023, to make two scripts. One to accept arguments to record different transactions and write them to a GeneralLedger.json file, and another to take arguments to output summary information regarding the GeneralLedger.json file.

## Usage
### transactions.js
The transactions.js script must always be called with three arguments, in the format of "-name=**name** -category=**category** -amount=**amount**", where 
* **name** is a string specifying the name of the item purchased in the transatcion
* **category** is a string specifying the category of the transaction
* **amount** is a float specifying the amount of money spent on the transaction

The **name** and **category** argument values must not be space delimited (i.e. Chicken Breast must be inputted as ChickenBreast) and the **amount** value must be a float that only goes to the hundredths place (i.e. 5.001 must be inputted as 5.00)

### summary.js
The summary.js can be called either with or without the following flags/arguments.
* **--category/-c**, must be followed by a space and a string for the flag. When passed this, the summary will only output transactions that fall under the given category
* **--interval/-i**, must be followed a space a string for the flag in the format of a number and a d, m, or y (i.e. 30d, 5y, 3m). When passed this, the script will only output transactions in the last interval value amount of time, where d specifies days, m specifies months, and y specifies years. 

## Examples of Valid Calls for Each Script
```
node transactions.js -name=ChickenBreast -category=Groceries -amount=5.99
```
```
node summary.js
node summary.js --category Groceries
node summary.js -c Groceries
node summary.js --interval 30d
node summary.js -i 30d
node summary.js --category Groceries -i 30d
```