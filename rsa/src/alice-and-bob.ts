import { readFile } from 'fs/promises'
import * as crypto from 'crypto'

void (async function () {
  const ALICE_PRIVATE_KEY = crypto.createPrivateKey(
    await readFile('./keys/alice'),
  )
  const ALICE_PUBLIC_KEY = crypto.createPublicKey(
    await readFile('./keys/alice.pub'),
  )
  const BOB_PRIVATE_KEY = crypto.createPrivateKey(await readFile('./keys/bob'))
  const BOB_PUBLIC_KEY = crypto.createPublicKey(
    await readFile('./keys/bob.pub'),
  )

  const data = Buffer.from('my secret data', 'utf8')

  const encryptedMessage = crypto.publicEncrypt(
    {
      key: BOB_PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    data,
  )

  console.log('encypted data:', encryptedMessage.toString('base64'))

  const signature = crypto.sign('sha256', encryptedMessage, {
    key: ALICE_PRIVATE_KEY,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  })

  console.log(signature.toString('base64'))

  const isVerified = crypto.verify(
    'sha256',
    encryptedMessage,
    {
      key: ALICE_PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    },
    signature,
  )

  console.log('signature verified:', isVerified)

  const decryptedData = crypto.privateDecrypt(
    {
      key: BOB_PRIVATE_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    encryptedMessage,
  )

  console.log('decrypted data:', decryptedData.toString())
})()
