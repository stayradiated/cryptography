import { createECDH } from 'crypto'

const CURVE = 'secp256k1'

const ecdh = createECDH(CURVE)
ecdh.generateKeys()

console.log(`
const MY_PRIVATE KEY = '${ecdh.getPrivateKey().toString('hex')}'
const MY_PUBLIC KEY = '${ecdh.getPublicKey().toString('hex')}'
`)
