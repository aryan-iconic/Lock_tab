const { subtle } = require('node:crypto').webcrypto;

(async function () {
    const key = await subtle.generateKey(
        {
            name: 'PBKDF2',
            length: 256,
            hash: 'SHA-256',
        },
        true,
        ['sign','verify','deriveKey']
    );

const enco = new TextEncoder();
const Message = enco.encode('DONE');

const degist = await subtle.sign(
    {
        name: 'PBKDF2',
        length: 256,},
        key,
        Message
    );

})();

