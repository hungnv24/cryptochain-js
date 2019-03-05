const Block = require('./block')
const { GENESIS_DATA } = require('./config')
const cryptoHash = require('./crypto-hash')

describe('Block', () => {
  const timestamp = 'adata'
  const lastHash = 'foohash'
  const hash = 'barhash'
  const data = ['blockchain', 'data']
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data
  })

  it('has timestamp, lastHash, hash, data', () => {
    expect(block.timestamp).toEqual(timestamp)
    expect(block.lastHash).toEqual(lastHash)
    expect(block.hash).toEqual(hash)
    expect(block.data).toEqual(data)
  })

  describe('genesis()', () => {
    const genesisBlock = Block.genesis()

    console.log('Genensis block', genesisBlock)
    
    it('returns an instance', () => {
      expect(genesisBlock instanceof Block).toBe(true)
    })

    it('returns genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA)
    })
  })

  describe('mineblock()', () => {
    const lastBlock = Block.genesis()
    const data = 'mined data'
    const minedBlock = Block.mineBlock({ lastBlock, data })

    it('returns a Block instance', () => {
      expect(minedBlock instanceof Block).toBe(true)
    })

    it('sets `lastHash` to be the `hash` of lastBlock', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash)
    })

    it('set a `data`', () => {
      expect(minedBlock.data).toEqual(data)
    })

    it('set a `timestamp`', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined)
    })

    it('create a SHA-256 `hash` based on proper inputs', () => {
      expect(minedBlock.hash)
        .toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data))
    })
  })
})