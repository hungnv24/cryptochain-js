const Blockchain = require('../blockchain')

const blockchain = new Blockchain()

blockchain.addBlock({ data: 'initial' })

console.log('first block', blockchain.chain[blockchain.chain.length - 1])

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average

const times = []

let sumTimes = 0

for (let i = 0; i < 100; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp

  blockchain.addBlock({ data: `block ${i}` })

  nextBlock = blockchain.chain[blockchain.chain.length - 1]
  nextTimestamp = nextBlock.timestamp

  timeDiff = nextTimestamp - prevTimestamp
  times.push(timeDiff)

  sumTimes += timeDiff
  average = sumTimes / times.length

  console.log(`Time to mine ${i}-th block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average}ms`)
}