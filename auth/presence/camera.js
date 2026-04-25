const worker = new Worker("presence-worker.js", { type: "module" });

await worker.postMessage({ type: "INIT" });

worker.onmessage = (e) => {
    if (e.data.type === "RESULT") {
        if (e.data.detected) {
            unlockTab();
        } else {
            lockTab();
        }
    }
};

async function loop(video) {
    const bitmap = await createImageBitmap(video);

    worker.postMessage(
        {
            type: "PROCESS_FRAME",
            frame: bitmap,
            timestamp: performance.now()
        },
        [bitmap]
    );

    requestAnimationFrame(() => loop(video));
}