# Using SSH RSA keys to send messages with Node.js

Shout out to Soham Kamani (@sohamkamani) He has a great blog post that really
helped me to get RSA encryption working:
https://www.sohamkamani.com/nodejs/rsa-encryption/

## Steps

1. Let's generate some RSA key pairs to test with. Note that these keys need to
   be in the PEM format, which is not the default. If you are using existing
   keys check that the first line is `-----BEGIN RSA PRIVATE KEY-----`. If it
   reads `-----BEGIN OPENSSH PRIVATE KEY-----` instead, you will need to
   manually convert the format first.

   It would be nice if the `-m pem` flag exported the public key as PEM format
   as well, but it doesn't so we need to manually convert it ourselves.

```shell
mkdir -p keys

ssh-keygen -t rsa -m pem -f ./keys/alice -q -N ""
mv ./keys/alice.pub ./keys/alice_openssh.pub
ssh-keygen -f ./keys/alice_openssh.pub -e -m pem > ./keys/alice.pub
rm ./keys/alice_openssh.pub

ssh-keygen -t rsa -m pem -f ./keys/bob -q -N ""
mv ./keys/bob.pub ./keys/bob_openssh.pub
ssh-keygen -f ./keys/bob_openssh.pub -e -m pem > ./keys/bob.pub
rm ./keys/bob_openssh.pub
```

2. Ok, now we load these keys into Node.js. If you're keys aren't in the
   correct format, Node.js will probably throw an error to let you know that.

```typescript
import { readFile } from 'fs/promises'
import * as crypto from 'crypto'

const ALICE_PRIVATE_KEY = crypto.createPrivateKey(await readFile('./keys/alice'))
const ALICE_PUBLIC_KEY = crypto.createPublicKey(await readFile('./keys/alice.pub'))
const BOB_PRIVATE_KEY = crypto.createPrivateKey(await readFile('./keys/bob'))
const BOB_PUBLIC_KEY = crypto.createPublicKey(await readFile('./keys/bob.pub'))
```

3. Alice can now encrypt a message using Bob's public key. Only Bob will able to decrypt this message.

```typescript
const message = 'Hello Bob!'

const encryptedMessage = crypto.publicEncrypt(
 {
   key: BOB_PUBLIC_KEY,
   padding: constants.RSA_PKCS1_OAEP_PADDING,
   oaepHash: 'sha256',
 },
 Buffer.from(data, 'utf8'),
)

console.log(encryptedMessage.toString('base64'))
```

4. You may notice that anyone can use Bob's public key to encrypt a message.
   How can Bob trust that this particular message is from Alice and not from
   someone pretending to be from Alice? One way is for Alice to sign the
   encrypted message with her private key.

   Note: it's important that Alice signs the encrypted message and not the
   plain message. This allows Bob to verify the sender before decrypting the
   message.

```typescript
const signature = crypto.sign("sha256", encryptedMessage, {
	key: ALICE_PRIVATE_KEY,
	padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
})

console.log(signature.toString("base64"))
```

6. Before Bob decrypts the data, he should verify that the message is from
   Alice.

```typescript
const isVerified = crypto.verify(
 'sha256',
 encryptedMessage,
 {
   key: ALICE_PUBLIC_KEY,
   padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
 },
 signature,
)

console.log('message is from alice:', isVerified)
```

6. Bob can now safely decrypt this message using his prviate key.

```typescript
const decryptedData = crypto.privateDecrypt(
 {
   key: BOB_PRIVATE_KEY,
   padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
   oaepHash: 'sha256',
 },
 encryptedMessage,
)

console.log(decryptedData.toString('utf8'))
```

