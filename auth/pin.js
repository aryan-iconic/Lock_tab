
async function hashPIN(pin) {
    const encoded = new TextEncoder().encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function verifyPIN(inputPin) {
    const storedHash = await getStoredPINHash();
    const inputHash = await hashPIN(inputPin);
    return storedHash === inputHash;
}

async function getStoredPINHash() {
    return new Promise((resolve) => {
        chrome.storage.local.get("pinHash", (result) => {
            resolve(result.pinHash || null);
        });
    });
}

async function setPIN(pin) {
    const pinHash = await hashPIN(pin);
    chrome.storage.local.set({ pinHash });
    console.log("PIN hash stored");
}