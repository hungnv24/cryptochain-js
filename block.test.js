const Block = require('./block')
const { GENESIS_DATA } = require('./config')

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
})