import * as openpgp from 'openpgp'

void (async function () {
  const keys = await openpgp.generateKey({
    type: 'ecc',
    curve: 'ed25519',
    userIDs: [{ name: 'George Czabania', email: 'george@czabania.com' }],
    passphrase: 'ELLIPTIC3diffused0canopener5stamina5reset8',
  })

  console.log(keys.privateKeyArmored)
  console.log(keys.publicKeyArmored)
})()
