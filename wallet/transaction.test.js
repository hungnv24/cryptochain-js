const Transaction = require('./transaction')
const Wallet = require('./index')
const { verifySignature } = require('../util')

describe('Transaction', () => {
  let transaction
  let senderWallet
  let recipient
  let amount

  beforeEach(() => {
    senderWallet = new Wallet()
    recipient = 'recipient-public-key'
    amount = 50

    transaction = new Transaction({
      senderWallet,
      recipient,
      amount
    })
  })

  it('has in `id`', () => {
    expect(transaction).toHaveProperty('id')
  })

  describe('outputMap', () => {
    it('has an `outputMap`', () => {
      expect(transaction).toHaveProperty('outputMap')
    })

    it('outputs the amount to the recipient', () => {
      expect(transaction.outputMap[recipient]).toEqual(amount)
    })

    it('outputs the remaining balance of the `senderWallet`', () => {
      expect(transaction.outputMap[senderWallet.publicKey])
        .toEqual(senderWallet.balance - amount)
    })
  })

  describe('input', () => {
    it('has an `input`',() => {
      expect(transaction).toHaveProperty('input')
    })

    it('has a `timestamp` in input', () => {
      expect(transaction.input).toHaveProperty('timestamp')
    })

    it('sets the`amount` to the `senderWallet` balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance)
    })

    it('sets the`address` to the `senderWallet` publickey', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey)
    })

    it('signs the input', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature
        })
      ).toBe(true)
    })
  })

  describe('validTransaction()', () => {
    let errorMock

    beforeEach(() => {
      errorMock = jest.fn()
      global.console.error = errorMock
    })

    describe('when the transaction is valid', () => {
      it('return true', () => {
        expect(Transaction.validTransaction(transaction)).toBe(true)
      })
    })

    describe('when transaction is invalid', () => {
      describe('and a transaction outputMap value is invalid', () => {
        it('return false and logs error', () => {
          transaction.outputMap[senderWallet.publicKey] = 9999999
          expect(Transaction.validTransaction(transaction)).toBe(false)
          expect(errorMock).toHaveBeenCalled()
        })
      })

      describe('and the transaction input siganture is invalid', () => {
        it('return false and logs error', () => {
          transaction.input.signature = new Wallet().sign('data')
          expect(Transaction.validTransaction(transaction)).toBe(false)
          expect(errorMock).toHaveBeenCalled()
        })
      })
    })
  })
})