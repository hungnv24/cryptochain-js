class TransactionMiner {
  constructor({ blockchain, transactionPool, wallet, pubsub }) {
    this.blockchain = blockchain
    this.transactionPool = transactionPool
    this.wallet = wallet
    this.pubsub = pubsub
  }

  mineTransactions() {
    // TODO: Get the transaction pool's valid transactions

    // TODO: Generate miner's reward

    // TODO: Add a block consisting of these transactions to the blockchain

    // TODO: Broadcast the updated blockchain

    // TODO: Clear the pool
  }
}

module.exports = TransactionMiner