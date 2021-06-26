# Using SSH RSA keys to send messages with Node.js

Shout out to Soham Kamani (@sohamkamani) He has a great blog post that really
helped me to get RSA encryption working:
https://www.sohamkamani.com/nodejs/rsa-encryption/

## Alice & Bob Example

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
ssh-keygen -f ./keys/alice.pub -e -m pem > ./keys/alice.pub.pem

ssh-keygen -t rsa -m pem -f ./keys/bob -q -N ""
ssh-keygen -f ./keys/bob_openssh.pub -e -m pem > ./keys/bob.pub.pem
```

2. Ok, now we load these keys into Node.js. If you're keys aren't in the
   correct format, Node.js will probably throw an error to let you know that.

```typescript
import { readFile } from 'fs/promises'
import * as crypto from 'crypto'

const ALICE_PRIVATE_KEY = crypto.createPrivateKey(await readFile('./keys/alice'))
const ALICE_PUBLIC_KEY = crypto.createPublicKey(await readFile('./keys/alice.pub.pem'))
const BOB_PRIVATE_KEY = crypto.createPrivateKey(await readFile('./keys/bob'))
const BOB_PUBLIC_KEY = crypto.createPublicKey(await readFile('./keys/bob.pub.pem'))
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

## Sending messages to your friends

1. Get your friends public key by querying their Github profile. Just add
   `.keys` after their username.

```shell
$ curl https://github.com/brendonjohn.keys > ./keys/brendonjohn.pub
```

2. Convert their public key to PEM format.

```shell
$ cat ./keys/brendonjohn.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQChf5z9dRhWuGhdglAOes3gug6ax2oCm7lZs3EOuaeGwxp6n1PJBhkveDXEaFgENbSFmhdyvnmCySGkevpXgyzubi3E4At7tFv6hr8Iy3J5FXhUzEl2cUriuI/t/TcvLyKrxXZj0MCTQxYVDgQRiNsn6AG7PGuDZwEi4q1APf4U/AoYR6WefnZCVCKQ/1etzZCLw/R/s9kHoLlozTyTV0tVZm9MAqB8wrlhJwa6Qc3PKoM/McO5IN1MVU510dz0nn0Ecy8x+GziPi0REf2kXKnxAHaRrV5qj7R+Gjm6y0fEVv+HxHOId2Sr9i+7Z/IOJGzJl6RyVh3Gd+hXsTUEWZgup+PncPFzIdckX/T9Fz+gv+cXfTOJ1xdKcr71hhIabyKOfd9NMgsCGxgx/2j3ZCcfFOsaFJHS+cwaF3aIrpNYZ+8rc7qlMcUb2LeonOQq0g9gRZTATUTqc9gRSp73jDKGPhBU2MP6NzJX95QvNgNiKKeT50DivSTbWCvymWAHAO7XmPlU0EOSEUFkYFrWjzrTfwB/4U9jf2irQAkpmsoYd+gLqhuWfvZV0mhFFy6z08LRQsMAzjg4dY+J+NlNRvQkzoXAVWwNrRcBIugKjCs+WghxrEku86BRMbWq9HvqV9uUzpbHOKk99c6+ytVbA0o7/Bb7ai02DPuhUuO8QKQKAw==

$ ssh-keygen -f ./keys/brendonjohn.pub -e -m pem > ./keys/brendonjohn.pub.pem

$ cat ./keys/brendonjohn.pub.pem
-----BEGIN RSA PUBLIC KEY-----
MIICCgKCAgEAoX+c/XUYVrhoXYJQDnrN4LoOmsdqApu5WbNxDrmnhsMaep9TyQYZ
L3g1xGhYBDW0hZoXcr55gskhpHr6V4Ms7m4txOALe7Rb+oa/CMtyeRV4VMxJdnFK
4riP7f03Ly8iq8V2Y9DAk0MWFQ4EEYjbJ+gBuzxrg2cBIuKtQD3+FPwKGEelnn52
QlQikP9Xrc2Qi8P0f7PZB6C5aM08k1dLVWZvTAKgfMK5YScGukHNzyqDPzHDuSDd
TFVOddHc9J59BHMvMfhs4j4tERH9pFyp8QB2ka1eao+0fho5ustHxFb/h8RziHdk
q/Yvu2fyDiRsyZekclYdxnfoV7E1BFmYLqfj53DxcyHXJF/0/Rc/oL/nF30zidcX
SnK+9YYSGm8ijn3fTTILAhsYMf9o92QnHxTrGhSR0vnMGhd2iK6TWGfvK3O6pTHF
G9i3qJzkKtIPYEWUwE1E6nPYEUqe94wyhj4QVNjD+jcyV/eULzYDYiink+dA4r0k
21gr8plgBwDu15j5VNBDkhFBZGBa1o86038Af+FPY39oq0AJKZrKGHfoC6obln72
VdJoRRcus9PC0ULDAM44OHWPifjZTUb0JM6FwFVsDa0XASLoCowrPloIcaxJLvOg
UTG1qvR76lfblM6WxzipPfXOvsrVWwNKO/wW+2otNgz7oVLjvECkCgMCAwEAAQ==
-----END RSA PUBLIC KEY-----
```

3. Import their public key.

```typescript
import { readFile } from 'fs/promises'
import * as crypto from 'crypto'

const FRIENDS_PUBLIC_KEY = crypto.createPublicKey(await
readFile('./keys/brendonjohn.pub'))
```

4. Encrypt a message using their public key.

```typescript
const data = Buffer.from('Hey Brendon!', 'utf8')

const encryptedMessage = crypto.publicEncrypt(
 {
   key: FRIENDS_PUBLIC_KEY,
   padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
   oaepHash: 'sha256',
 },
 data,
)
```

5. Sign the message using your own private key.

```typescript
const MY_PRIVATE_KEY = crypto.createPrivateKey(await readFile(`/home/admin/.ssh/id_rsa`))
const MY_PUBLIC_KEY = crypto.createPublicKey(await readFile(`/home/admin/.ssh/id_rsa.pub.pem`))

const signature = crypto.sign('sha256', encryptedMessage, {
 key: MY_PRIVATE_KEY,
 padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
})
```

6. Send your friend the encrypted message and the signature! Plus, also make
   sure they know your public key!

```typescript
console.log(JSON.stringify({
   encryptedMessage: encryptedMessage.toString('base64'),
   signature: signature.toString('base64'),
   publicKey: MY_PUBLIC_KEY.export({ type: 'pkcs1', format: 'pem' })
}, null, 2))
```

```json
{
  "encryptedMessage": "McsoEf8MSXqsZGr+VuY+QIqArnH6ouRSfjKhPM/tzCzVP4bDKLYG7SvTMY6B5T3dw7FWWaqJoO6Vu5NEVEv4R7tZfV0bJflQF5XE4XnaBPrV/PxR3BH1fXcn1hHc21UUKYCpi9YFgNWSAxy0XixGn3Fz89WuXXPeAXqyDdpivboVmV+NVf/Nquv6ybcNxnm/OiSXm9e/Ldj+uqIgCP7kZOkRg3XqyGuebqraKCpoFCCMeBRPtjeCzvQj76WfCr05XFrKlILRTuLkJhjBDu1/tmLtgJTfxJyq62NRLTIJ9zq8wQJFFxnHZK/zijPqLSwEuQ2YEor18NGVIIvPT5kU3O58xJO+JnDNV3ELojWArozb0iBjgbWVn6FEveWNN7g1OHAWexDiKBM3a4U4muDj5P9idnOSJWlDigECelmpCM2NxAiNqxSYyIwnEzhznHGoCZVyrx3Peu8pLCbVUgFb/oSNFhxXAYoWCa9R+K4T5F5C+GXXvG9AyUaX6R/aN7L0nkUCyVTCCLOiLoGRFPggSkOzlnlykEI57A5tJNlPfTnB9+uUxjn5En/1T9wK8SjkqzodqRjLfkSRqvWQBVp15IQp+I8CzW9TbQkO259z9IR+fEJXESuKF4W4dsiLsx9rHwFzpOUlbp96ZVY+N9nyyc2TYJH7WJteQ5qe56yxfcM=",
  "signature": "sy4QQ5HL91qiEn8CL3Uc4Z+15WLlwfYZ4JL7Vlh+96SFZQMp6Ldf+ruYDK30UycLlpihFnyShZyZlfDbBeYNQUHny1bjopKPzyxB5fU9PgBQB5iSOkVRgcjYvpr2wuGpLtLQ8GRAPC8g45z5L3EiqLCVhqC+Zixcp7eaTnQoDksjlTe3PRKVJjsEYzLEd2Qv+acQaUtfMLqTPGjWyQNPVAZnxx++Mos3sxXMZF1CKVWkBOmSZyfaXDAivOpESkr7J7mR39zMxxDlYdCtwyhxpau2baWRlyu8tIHDmYK3JrvKB0nXL6sGoUz2ywb3tFnesLhGF7yWA7pMPiAoXQjmCA==",
  "publicKey": "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA0CyDHRdBsfF389S++bu5oqjQ6vvMuWR27IIY4oTTFuXJ/t5fzQ3G\nAeB4eho4Bg6bhz0Ouayyfi6mDckE39ciRivy+M3H6ax7o2U+PkbSm3uIl+vdN75+\n96Nx2KsG7DA04eM/nx+i5oLF+TYEPS//sbs86HTdcVFjqn+uBCNy5xp0d6eFyMrB\nRl+NvT0GKP5s1lqxKXCXAfgBifNR8JFSKtOuUNA3vnK+h93R3HD1LC7C1qF2VxUJ\nSgCOFbRUdja3Nb1QWSldu9Y1xIBYpH+DNhRazO8etluTlNCquMpE+pmIV7gM9n6s\n0UmOX/bOnv7sfyGHKLvfWCklXxqiaHRaOwIDAQAB\n-----END RSA PUBLIC KEY-----\n"
}
```

7. Your friend should be able to verify that it was you who sent the message
   and decrypt it with their own private key!
