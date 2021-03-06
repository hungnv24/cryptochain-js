const redis = require('redis')

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
}

class PubSub {
  constructor({ blockchain, transactionPool }) {
    this.blockchain = blockchain
    this.transactionPool = transactionPool

    this.publisher = this.getConnection()
    this.subcriber = this.getConnection()

    this.subscribeToChannels()

    this.subcriber.on(
      'message', 
      (channel, message) => this.handleMessage(channel, message)
    )
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subcriber.subscribe(channel)
    })
  }

  getConnection() {
    const client = redis.createClient(6379, '127.0.0.1')

    client.on('connect', () => {
      console.log("Redis connected")
    })

    client.on("error", (err) => {
      console.error(`Something went wrong with Redis. Error: ${err}`)
    })

    return client
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}`)

    const parsedMessage = JSON.parse(message)

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, true, () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMessage
          })
        })
        break
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage)
      default:
        return
    }
  }

  publish({ channel , message }) {
    this.subcriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subcriber.subscribe(channel)
      })
    })
    
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    })
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    })
  }
}

module.exports = PubSub