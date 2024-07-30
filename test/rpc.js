/**
 * Fetches and logs the approved transactions for a given tick.
 * 
 * @param {number} tick - The tick number to fetch approved transactions for.
 */
async function blockTransactions(tick){
    const currentTick = 12956870;
    const response = await fetch(`https://testapi.qubic.org/v1/ticks/${tick}/approved-transactions`);
    console.log("resp", response.status);
    const res = await response.json();

    console.log("result", res);
}

/**
 * Fetches and logs the approved transactions for a given transaction ID.
 * 
 * @param {string} tx - The transaction ID to fetch approved transactions for.
 */
async function verifyTx(tx){
    const response = await fetch(`https://testapi.qubic.org/v1/ticks/${tx}/approved-transactions`);
    console.log("resp", response.status);
    const res = await response.json();

    console.log("result", res);
}

// Example usage of the blockTransactions function
blockTransactions(13114682);
