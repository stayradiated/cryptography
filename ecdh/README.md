# Using ECDH to send messages

Shoutout to Brendon (@brendonjohn) for getting me back into cryptography!

We found it a little tricky to send messages using private/public keys, so I've
written done some notes about how to do it with Node.js

## Steps

1. You and a friend need to first pick a curve to use. You can find a list of
   curves from `crypto.getCurves()`. I don't know which curve is the best to
   use.

```typescript
const CURVE = 'secp256k1'
```

2. Generate your own private keys using that curve. Don't lose your private
   key! You can run this script with `node ./dist/generate-keys.js`.

```typescript
import { createECDH } from 'crypto'

const ecdh = createECDH(CURVE)
ecdh.generateKeys()

console.log(`
const MY_PRIVATE KEY = '${ecdh.getPrivateKey().toString('hex')}'
const MY_PUBLIC KEY = '${ecdh.getPublicKey().toString('hex')}'
`)
```

3. We share our public keys with each other.

```typescript
const FRIENDS_PUBLIC_KEY = '04032bf0132…'
```

4. We can reload a previously generated private key using `ecdh.setPrivateKey`.

```typescipt
const MY_PRIVATE KEY = '6e6bce6203…'

const me = createECDH(CURVE)
me.setPrivateKey(Buffer.from(MY_PRIVATE_KEY, 'hex'))
```

5. Now for the fun bit, we can both compute the same secret by using `ecdh.computeSecret`. No one else can calculate this secret without knowing our private keys!

```typescript
const secret = me.computeSecret(Buffer.from(FRIENDS_PUBLIC_KEY, 'hex'))
// secret is be a 32-byte Buffer
```

6. We can now encrypt messages using this secret.

```typescript
const iv = Buffer.alloc(16) // use an empty IV so we don't have to share this.
const cipher = createCipheriv('aes-256-ctr', secret, iv)
```

7. Creating a decipher is much the same:

```typescript
const cipher = createDeipheriv('aes-256-ctr', secret, iv)
```

8. See `./src/index.ts` for details on how to use the cipher to encrypt/decrypt
   messages.
