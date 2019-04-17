const Blockchain = require('./index')
const Block = require('./block')
const { cryptoHash } = require('../util')
const Wallet = require('../wallet')
const Transaction = require('../wallet/transaction')

describe('Blockchain', () => {
  let blockchain, newChain, originalChain, errorMock

  beforeEach(() => {
    blockchain = new Blockchain()
    newChain = new Blockchain()
    originalChain = blockchain.chain

    errorMock = jest.fn()
    global.console.error = errorMock
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
    let logMock

    beforeEach(() => {
      logMock = jest.fn()
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

      describe('and validatTransaction flag is true', () => {
        it('calls validTransactionData()', () => {
          const validTransactionDataMock = jest.fn()

          blockchain.validTransactionData = validTransactionDataMock
          
          newChain.addBlock({ data: 'foo' })
          blockchain.replaceChain(newChain.chain, true)

          expect(validTransactionDataMock).toHaveBeenCalled()
        })
      })
    })
  })

  describe('validTransactionData()', () => {
    let transaction, rewardTransaction, wallet

    beforeEach(() => {
      wallet = new Wallet()
      transaction = wallet.createTransaction({
        recipient: 'foo-address',
        amount: 65
      })
      rewardTransaction = Transaction.rewardTransaction({
        minerWallet: wallet
      })
    })

    describe('and the transaction data is valid', () => {
      it('returns true', () => {
        newChain.addBlock({
          data: [transaction, rewardTransaction]
        })
  
        expect(blockchain.validTransactionData({ chain: newChain.chain }))
          .toBe(true)

        expect(errorMock).not.toHaveBeenCalled()
      })
    })
  
    describe('and the transaction data has multiple rewards', () => {
      it('return false', () => {
        newChain.addBlock({ data: [ transaction, rewardTransaction, rewardTransaction ] })
  
        expect(blockchain.validTransactionData({ chain: newChain.chain }))
          .toBe(false)
        
        expect(errorMock).toHaveBeenCalled()
      })
    })
  
    describe('and and the transaction data has at least one malformed outputMap', () => {
      describe('and the transaction is not a reward transaction', () => {
        it('return false', () => {
          transaction.outputMap[wallet.publicKey] = 999999
  
          newChain.addBlock({ data: [transaction, rewardTransaction] })

          expect(blockchain.validTransactionData({ chain: newChain.chain }))
            .toBe(false)

          expect(errorMock).toHaveBeenCalled()
        })
      })
  
      describe('and the transaction is a reward transaction', () => {
        it('return false', () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999
  
          newChain.addBlock({ data: [transaction, rewardTransaction] })

          expect(blockchain.validTransactionData({ chain: newChain.chain }))
            .toBe(false)
          
          expect(errorMock).toHaveBeenCalled()
        })
      })

      describe('and the transaction data has at least one malformed input', () => {
        it('return false and log error', () => {
          wallet.balance = 9000

          const evilOutputMap = {
            [wallet.publicKey]: 8900,
            fooRecipient: 100
          }

          const evilTransaction = {
            input: {
              timestamp: Date.now(),
              amount: wallet.balance,
              address: wallet.publicKey,
              signature: wallet.sign(evilOutputMap)
            },
            outputMap: evilOutputMap
          }

          newChain.addBlock({ data: [evilTransaction, rewardTransaction] })

          expect(blockchain.validTransactionData({ chain: newChain.chain }))
            .toBe(false)

          expect(errorMock).toHaveBeenCalled()
        })
      })
    
      describe('and a block contain multiple identical transactions', () => {
        it('return false and log error', () => {  
          newChain.addBlock({ data: [transaction, transaction, rewardTransaction] })

          expect(blockchain.validTransactionData({ chain: newChain.chain }))
            .toBe(false)
          
          expect(errorMock).toHaveBeenCalled()
        })
      })
    })
  })
})