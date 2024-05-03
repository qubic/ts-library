'use strict';

async function blockTransactions(tick) {
    try {
        const fetch = await import("node-fetch");
        const currentTick = 12956870;
        const response = await fetch.default(`https://testapi.qubic.org/v1/ticks/${tick}/approved-transactions`);
        console.log("resp", response.status);
        const res = await response.json();
        console.log("result", res);
    } catch (error) {
        console.error("Error fetching block transactions:", error);
    }
}

async function verifyTx(tx) {
    try {
        const fetch = await import("node-fetch");
        const response = await fetch.default(`https://testapi.qubic.org/v1/ticks/${tx}/approved-transactions`);
        console.log("resp", response.status);
        const res = await response.json();
        console.log("result", res);
    } catch (error) {
        console.error("Error verifying transaction:", error);
    }
}

verifyTx("zayvdldairwwecapgelwfeltvavevehjqpxlybqvcdnngphxdeuukolgglva");
blockTransactions(13114682);
