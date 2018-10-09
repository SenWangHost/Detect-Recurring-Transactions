# Detect-Recurring-Transactions
## Tech Stack
ZeroMQ
mongoDB
mongoose as ODM

## criteria for identifying the recurring group
1. the group needs to have at least 3 data points
2. the standard deviation of time interval should be less than or equal to 10.0
3. the standard deviation of amount should be less than or equal to 100.0
