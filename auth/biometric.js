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
                name: [],
                displayName: [],
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

            chrome.storage.local.set(
                "credId",
                bufferToBase64(credential.rawId)
            );

            console.log("Credential created & stored");
        }

    } catch (error) {
        console.error("Registration failed:", error);
    }
}

function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function loadCredential() {
    const saved = chrome.storage.local.get("credId");
    if (!saved) return null;

    const binary = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
    return binary.buffer;
}

let storedCredentialId = loadCredential();

async function main() {
    if (!storedCredentialId) {
        await registerCredential();
    }

    const isAuthenticated = await authenticateWithBiometrics();

    console.log(isAuthenticated ? "Success" : "Failed");
}

main();
