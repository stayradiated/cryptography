import * as openpgp from 'openpgp'

const PASSPHRASE = 'ELLIPTIC3diffused0canopener5stamina5reset8'

const PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEYNb/uhYJKwYBBAHaRw8BAQdAYDpb84YPV4pxLGfE1dzFyL9NayQ0b4R3
crQiwDH0rTDNJUdlb3JnZSBDemFiYW5pYSA8Z2VvcmdlQGN6YWJhbmlhLmNv
bT7CjAQQFgoAHQUCYNb/ugQLCQcIAxUICgQWAAIBAhkBAhsDAh4BACEJEH0f
xc7PxuQ7FiEEEylnEkU3so5qcNUffR/Fzs/G5DvFegEAqN+lzZD3qzFsXDpu
Gjv2X914L8oSc5iMmuJ0FVlvxkQA/iRs8uAGULWV4bX2BF+FVDjkVSRwiQg7
tIi3AriNFVwNzjgEYNb/uhIKKwYBBAGXVQEFAQEHQPW8WHgOjdvU9JrDQ5kO
F1jWlzJVwJncqFAGzzS4dnZwAwEIB8J4BBgWCAAJBQJg1v+6AhsMACEJEH0f
xc7PxuQ7FiEEEylnEkU3so5qcNUffR/Fzs/G5DvfMgD/evLMJCmQKtaMscZ4
2r5DH3rkX9WHdpk0IOp+6kxcyysBAMvsIKpSpY9fFZg6eYPkNxteRf93XAWN
9bcufI3tu/cI
=iBZu
-----END PGP PUBLIC KEY BLOCK-----`

const PRIVATE_KEY = `
-----BEGIN PGP PRIVATE KEY BLOCK-----

xYYEYNb/uhYJKwYBBAHaRw8BAQdAYDpb84YPV4pxLGfE1dzFyL9NayQ0b4R3
crQiwDH0rTD+CQMI1BSl2thsim/gq0n7mfnRzwJTtbBW9+lpXTK88EqHgB00
WhMwyoDi8rOLjFzNg2C6cTYqp5ISD4MgXeiJ8D8DdkTSKibTJZUHPwCgzQKA
qc0lR2VvcmdlIEN6YWJhbmlhIDxnZW9yZ2VAY3phYmFuaWEuY29tPsKMBBAW
CgAdBQJg1v+6BAsJBwgDFQgKBBYAAgECGQECGwMCHgEAIQkQfR/Fzs/G5DsW
IQQTKWcSRTeyjmpw1R99H8XOz8bkO8V6AQCo36XNkPerMWxcOm4aO/Zf3Xgv
yhJzmIya4nQVWW/GRAD+JGzy4AZQtZXhtfYEX4VUOORVJHCJCDu0iLcCuI0V
XA3HiwRg1v+6EgorBgEEAZdVAQUBAQdA9bxYeA6N29T0msNDmQ4XWNaXMlXA
mdyoUAbPNLh2dnADAQgH/gkDCNh4gNMZVRxo4ILuFOshrg6YXyKANX9/OlY3
dScFl+RduDvGsnmp5/XbUtGM1M2ZGBp9Qi+VJ7Se75/qRfffLi3F/A5xGe+0
29ZkqUCSW+jCeAQYFggACQUCYNb/ugIbDAAhCRB9H8XOz8bkOxYhBBMpZxJF
N7KOanDVH30fxc7PxuQ73zIA/3ryzCQpkCrWjLHGeNq+Qx965F/Vh3aZNCDq
fupMXMsrAQDL7CCqUqWPXxWYOnmD5DcbXkX/d1wFjfW3LnyN7bv3CA==
=Aa14
-----END PGP PRIVATE KEY BLOCK-----`

void (async function () {
  const publicKey = await openpgp.readKey({ armoredKey: PUBLIC_KEY })

  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readKey({ armoredKey: PRIVATE_KEY }),
    passphrase: PASSPHRASE,
  })

  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({
      text: JSON.stringify({
        apiKey: 'MHdWUXNuj69E2cxZBpB2sXD9wLHr13vMPhs8l1+NhWg=',
        apiSecret: 'd9wphN2/JmfhY5RGtprCAge2dpo43X3ayUuMvR9wBkM=',
      }),
    }),
    encryptionKeys: publicKey,
  })
  console.log(encrypted)

  const message = await openpgp.readMessage({
    armoredMessage: encrypted,
  })

  const { data: decrypted } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey,
  })
  console.log(JSON.parse(decrypted))
})()
