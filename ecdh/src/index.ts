import { createCipheriv, createDecipheriv, createECDH } from 'crypto'
import { Readable } from 'stream'

import readStream from './read-stream.js'

const CURVE = 'secp256k1'

const MY_PRIVATE_KEY =
  '55024a9418159a880f3fcb5882995cb9fd47bf76bd75b4be2aa400c43e4b726f'
const MY_PUBLIC_KEY =
  '04032bf0132b2826e666dc911002064de15c33268c930d7730f2952f2fb4c2d5922f78bb9c12730e8b180670895ee6e2d965bc1e5d9d75d9cb0942fef9740479a0'

const FRIENDS_PUBLIC_KEY =
  '04571df662964e10d577526357a1290e7b3002c74ff46f24f0d9d9a03b806247aa9eb748fc53d370308bb7221ceef82ebd4c88e06ac3cfcbc789f36eedd4b6ff6d'
const FRIENDS_PRIVATE_KEY =
  'f2b864667c05a5f83e9535ace3c997aa92d9a455ee2e6e50b8e942568c02cf57'

const encryptMessage = async (message: string): Promise<Buffer> => {
  const me = createECDH(CURVE)
  me.setPrivateKey(Buffer.from(MY_PRIVATE_KEY, 'hex'))

  const secret = me.computeSecret(Buffer.from(FRIENDS_PUBLIC_KEY, 'hex'))

  const cipher = createCipheriv('aes-256-ctr', secret, Buffer.alloc(16))
  const input = Readable.from(Buffer.from(message, 'utf8'), {
    objectMode: false,
  })
  const encryptedMessage = await readStream(input.pipe(cipher))

  return encryptedMessage
}

const decryptMessage = async (encryptedMessage: Buffer): Promise<string> => {
  const friend = createECDH(CURVE)
  friend.setPrivateKey(Buffer.from(FRIENDS_PRIVATE_KEY, 'hex'))

  const secret = friend.computeSecret(Buffer.from(MY_PUBLIC_KEY, 'hex'))

  const cipher = createDecipheriv('aes-256-ctr', secret, Buffer.alloc(16))
  const input = Readable.from(encryptedMessage, { objectMode: false })
  const message = await readStream(input.pipe(cipher))

  return message.toString('utf8')
}

void (async function () {
  const encryptedMessage = await encryptMessage('hello world')
  console.log(encryptedMessage)

  const output = await decryptMessage(encryptedMessage)
  console.log(output)
})()
