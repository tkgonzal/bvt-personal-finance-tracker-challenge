# Personal Finance Tracker

### Description

Tracking your purchases against a budget is an important step towards achieving financial wellness and stability.

### Acceptance Criteria
 - Create a script, executable via a shell that will accept the following arguments:
   - Item name: The item that was purchased (e.g., "Auto Loan Payment", "Chicken breast", etc.). This is a string.
   - Item category: What category the item belongs to (e.g. "Groceries" if the item name is "Chicken breast"). This is a string.
   - Amount: The price of the item that was purchased. This is a decimal with two points of precision (e.g., $5.99).
 - Write any transactions entered to a general ledger. 
   - This will be written to a file on disk (not using a database).
   - You can find an example under `sample-data/GeneralLedger.json`.
   - All items written to the general ledger should include the three arguments _and_ an insert timestamp that logs when the item was written to the general ledger.
 - Create a script that will ingest all the data from the general ledger and will output a summary that will accept the following flags:
   - `--category` or `-c`: The item category.
   - `--interval` or `-i`: The time interval. For example, `-i 30d` will output a summary of all items in the general ledger from the last 30 days.
   - The following interval types should be supported: 
     - `d`: day
     - `m`: month
     - `y`: year
   - Negative values should return an error (i.e., `-i -5y`)
   - The summary should have the following information:
     - Each transaction's item name, category, amount, and timestamp.
     - A breakdown of each category and amount per category
       - For example, if the ledger has three purchases of chicken breast in the amount of $5.99 per chicken breast, the summary may be: "Groceries - $17.97" 
 - Upload your code in a folder in [Google Drive](https://drive.google.com/drive/folders/1JqkI1S0mB1SUo30NwPdSz3s9PINi9Soo?usp=sharing).

### Important Notes
 - Be careful of floating point arithmatic. 0.01 + 0.02 != 0.03
   - You may want to research best practices for adding floating point numbers together, namely with dollars and cents.
