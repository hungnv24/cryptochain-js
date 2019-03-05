const crypto = require('crypto')

const cryptoHash = (...args) => {
  args.sort()
  
  const hash = crypto.createHash('sha256')
  hash.update(args.join(' '))
  
  return hash.digest('hex')
}

module.exports = cryptoHash