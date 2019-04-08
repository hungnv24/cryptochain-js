const Transaction = require('./transaction')

class TransactionPool {
  constructor() {
    this.transactionMap = {}
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction
  }

  existingTransaction({ inputAddress }) {
    const transactions = Object.values(this.transactionMap)

    return transactions.find((t) => t.input.address === inputAddress)
  }

  validTransactions() {
    return Object.values(this.transactionMap).filter(
      (t) => Transaction.validTransaction(t)
    )
  }
}

module.exports = TransactionPool