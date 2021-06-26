import { readFile } from 'fs/promises'
import * as crypto from 'crypto'

void async function () {
  const FRIENDS_PUBLIC_KEY = crypto.createPublicKey(await
  readFile('./keys/brendonjohn.pub.pem'))

  const data = Buffer.from('Hey Brendon!', 'utf8')

  const encryptedMessage = crypto.publicEncrypt(
   {
     key: FRIENDS_PUBLIC_KEY,
     padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
     oaepHash: 'sha256',
   },
   data,
  )

  const MY_PRIVATE_KEY = crypto.createPrivateKey(await readFile(`/home/admin/.ssh/id_rsa`))
  const MY_PUBLIC_KEY = crypto.createPublicKey(await readFile(`/home/admin/.ssh/id_rsa.pub.pem`))

  const signature = crypto.sign('sha256', encryptedMessage, {
   key: MY_PRIVATE_KEY,
   padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  })

  console.log(JSON.stringify({
     encryptedMessage: encryptedMessage.toString('base64'),
     signature: signature.toString('base64'),
     publicKey: MY_PUBLIC_KEY.export({ type: 'pkcs1', format: 'pem' })
  }, null, 2))
}()
