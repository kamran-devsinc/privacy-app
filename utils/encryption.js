const NodeRSA = require('node-rsa')

const encrypt = (text) => {
  const key = new NodeRSA({ b: 512 }).generateKeyPair()
  const exportedKey = key.exportKey()
  const encryptedText = key.encrypt(text, 'base64')
  return { key: exportedKey, encryptedText }
}

const decrypt = (encryptedText, privateKey) => {
  const key = new NodeRSA()
  key.importKey(privateKey)
  return key.decrypt(encryptedText, 'utf8')
}

module.exports = {
  encrypt,
  decrypt,
}
