const redis = require('redis')

const CHANNELS = {
  TEST: 'TEST'
}

class PubSub {
  constructor() {
    this.publisher = this.getConnection()
    this.subcriber = this.getConnection()

    this.subcriber.subscribe(CHANNELS.TEST)

    this.subcriber.on(
      'message', 
      (channel, message) => this.handleMessage(channel, message)
    )
  }

  getConnection() {
    const client = redis.createClient()

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
  }
}

const testPubSub = new PubSub()
setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, "foo"), 1000)
