async function authenticateWithBiometrics() {
    if (!window.PublicKeyCredential || !storedCredentialId) {
        console.error("WebAuthn not supported or no credential.");
        return false;
    }

    try {
        const publicKey = {
            challenge: crypto.getRandomValues(new Uint8Array(32)),

            allowCredentials: [
                {
                    type: "public-key",
                    id: storedCredentialId,
                },
            ],

            userVerification: "required",
            timeout: 60000,
        };

        const credential = await navigator.credentials.get({ publicKey });

        console.log("Authenticated:", credential);

        unlockScreen();
        return true;

    } catch (error) {
        console.error("Auth failed:", error);
        stayLocked();
        return false;
    }
}

function unlockScreen() {
    const el = document.getElementById("overlay");
    if (el) el.style.display = "none";
}

function stayLocked() {
    alert("Authentication failed");
}

async function registerCredential() {
    try {
        const publicKey = {
            challenge: crypto.getRandomValues(new Uint8Array(32)),

            rp: {
                name: "Tab Lock",
            },

            user: {
                id: crypto.getRandomValues(new Uint8Array(16)),
                name: "user",
                displayName: "User",
            },

            pubKeyCredParams: [
                { type: "public-key", alg: -7 }
            ],

            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required",
            },

            timeout: 60000,
        };

        const credential = await navigator.credentials.create({ publicKey });

        if (credential) {
            storedCredentialId = credential.rawId;
            await saveCredential(credential.rawId);
            console.log("Credential created & stored");
            return true;
        }
        return false;

    } catch (error) {
        console.error("Registration failed:", error);
        return false;
    }
}

function bufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function saveCredential(buffer) {
    return new Promise((resolve) => {
        chrome.storage.local.set(
            { credId: bufferToBase64(buffer) },
            resolve
        );
    });
}

function loadCredential() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["credId"], (result) => {
            if (!result.credId) return resolve(null);
            resolve(base64ToBuffer(result.credId));
        });
    });
}

async function checkHardwareSupport() {
    if (!window.PublicKeyCredential) return false;
    return await PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable();
}

async function handlesetup() {
    const supported = await checkHardwareSupport();
    if(!supported) {
        return {supported: false};
    }
    return {supported: true};
}
async function unclock() {
    const biometricEnabled = await getBiometricEnabled();
    if (!biometricEnabled) {
        ShowPINflow();
        return false;
    }
    const supported = await checkHardwareSupport();
    if (!supported) {
        ShowPINflow();
        return false;
    }
    return await authenticateWithBiometrics();
}

async function initializeCredential() {
    storedCredentialId = await loadCredential();
}

async function main() {
    await initializeCredential();
    
    if (!storedCredentialId) {
        const registered = await registerCredential();
        if (!registered) {
            console.error("Failed to register credential");
            return false;
        }
    }

    const isAuthenticated = await authenticateWithBiometrics();
    console.log(isAuthenticated ? "Success" : "Failed");
    return isAuthenticated;
}

main();
