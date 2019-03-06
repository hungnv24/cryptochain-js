const Blockchain = require('./blockchain')
const Block = require('./block')

describe('Blockchain', () => {
  let blockchain = new Blockchain()

  beforeEach(() => {
    blockchain = new Blockchain()
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
    })
  })
})