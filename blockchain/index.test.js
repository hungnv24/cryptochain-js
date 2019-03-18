const Blockchain = require('./index')
const Block = require('./block')
const cryptoHash = require('../util/crypto-hash')

describe('Blockchain', () => {
  let blockchain, newChain, originalChain

  beforeEach(() => {
    blockchain = new Blockchain()
    newChain = new Blockchain()
    originalChain = blockchain.chain
  })

  it('contain a `chain` Array instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true)
  })

  it('starts with genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis())
  })

  it('adds new block to the chain', () => {
    const newData = 'foo bar'
    blockchain.addBlock({data: newData})

    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData)
  })
  
  describe('isValidChain()', () => {
    describe('when the chain does not start with genesis block', () => {
      it('return false', () => {
        blockchain.chain[0] = {data: 'fake-genes'}
        
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
      })
    })

    describe('when the chain starts with genesis block and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({ data: 'Bears' })
        blockchain.addBlock({ data: 'Beets' })
        blockchain.addBlock({ data: 'Star Wars' })
      })

      describe('and a lastHash ref has changed', () => {
        it('return false', () => {
          blockchain.chain[2].lastHash = 'broken-one'

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })

      describe('and chain contains a block with invalid field', () => {
        it('return false', () => {
          blockchain.chain[2].data = 'broken-data'

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })

      describe('and chain does not contain any invalid block', () => {
        it('return true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
        })
      })

      describe('and the chain contains a block with a jumped difficulty', () => {
        it('return false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1]
          const lastHash = lastBlock.hash
          const timestamp = Date.now()
          const data = []
          const difficulty = lastBlock.difficulty - 3
          const nonce = 0
          const hash = cryptoHash(timestamp, lastHash, data, difficulty, nonce)

          const badBlock = new Block({
            lastHash, timestamp, hash, nonce, difficulty, data
          })

          blockchain.chain.push(badBlock)
        
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })
    })
  })

  describe('replaceChain()', () => {
    let errorMock, logMock

    beforeEach(() => {
      errorMock = jest.fn()
      logMock = jest.fn()

      global.console.error = errorMock
      global.console.log = logMock
    })

    describe('when new chain is not longer', () => {
      beforeEach(() => {
        newChain.chain[0] = { new: 'chain' }
        blockchain.replaceChain(newChain.chain)
      })

      it('does not replace the chain', () => {
        expect(blockchain.chain).toEqual(originalChain)
      })

      it('logs an error', () => {
        expect(errorMock).toHaveBeenCalled()
      })
    })

    describe('when the new chain is longer', () => {
      beforeEach(() => {
        newChain.addBlock({ data: 'Bears' })
        newChain.addBlock({ data: 'Beets' })
        newChain.addBlock({ data: 'Star Wars' })
      })

      describe('and the chain is invalid', () => {
        it('does not replace the chain', () => {
          newChain.chain[1].hash = 'fake'

          blockchain.replaceChain(newChain.chain)

          expect(blockchain.chain).toEqual(originalChain)
        })
      })

      describe('and the chain is valid', () => {
        it('replaces the chain', () => {
          blockchain.replaceChain(newChain.chain)

          expect(blockchain.chain).toEqual(newChain.chain)
        })
      })
    })
  })
})