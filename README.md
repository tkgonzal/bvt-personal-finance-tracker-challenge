# Personal Finance Tracker Coding Challenge
A coding challenge from Bay Valley Tech given on 9/7/2023, to make two scripts. One to accept arguments to record different transactions and write them to a GeneralLedger.json file, and another to take arguments to output summary information regarding the GeneralLedger.json file.

## Usage
### transactions.js
A script to record transactions made to the ledger file.

The transactions.js script must always be called with three arguments:
* **--name/-n** is a string specifying the name of the item purchased in the transaction
* **--category/-c** is a string specifying the category of the transaction
* **--amount/-a** is a float specifying the amount of money spent on the transaction

### summary.js
A script to output categorical transaction breakdowns from the ledger file.

The summary.js can be called either with or without the following options:
* **--category/-c**, must be followed by a string for the option value. When passed this, the summary will only output transactions that fall under the given category
* **--interval/-i**, must be followed by a string for the option value in the format of a number and a d, m, or y (i.e. 30d, 5y, 3m). When passed this, the script will only output transactions in the last interval value amount of time, where d specifies days, m specifies months, and y specifies years. 
