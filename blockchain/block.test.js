const hexToBinary = require('hex-to-binary')
const Block = require('./block')
const { GENESIS_DATA, MINE_RATE } = require('../config')
const { cryptoHash } = require('../util')

describe('Block', () => {
  const timestamp = 2000
  const lastHash = 'foohash'
  const hash = 'barhash'
  const data = ['blockchain', 'data']
  const nonce = 1
  const difficulty = 1
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty
  })

  it('has timestamp, lastHash, hash, data', () => {
    expect(block.timestamp).toEqual(timestamp)
    expect(block.lastHash).toEqual(lastHash)
    expect(block.hash).toEqual(hash)
    expect(block.data).toEqual(data)
    expect(block.nonce).toEqual(nonce)
    expect(block.difficulty).toEqual(difficulty)
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
        .toEqual(
          cryptoHash(
            minedBlock.timestamp,
            lastBlock.hash,
            data,
            minedBlock.nonce,
            minedBlock.difficulty
          )
        )
    })

    it('sets a `hash` matches the difficulty criteria', () => {
      expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
        .toEqual('0'.repeat(minedBlock.difficulty))
    })

    it('adjusts the difficulty', () => {
      const posibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty -1]

      expect(posibleResults.includes(minedBlock.difficulty)).toBe(true)
    })
  })

  describe('adjustDifficulty()', () => {
    it('raises the difficulty for a quickly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE - 100
      })).toEqual(block.difficulty + 1)
    })

    it('lowers the difficulty for a slowly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE + 100
      })).toEqual(block.difficulty - 1)
    })

    it('has lower limit of 1', () => {
      block.difficulty  = -1

      expect(Block.adjustDifficulty({
        originalBlock: block
      })).toEqual(1)
    })
  })
})