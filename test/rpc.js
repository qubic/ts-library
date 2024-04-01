
async function blockTransactions(tick){
    const currentTick = 12956870;
    const response = await fetch(`https://testapi.qubic.org/v1/ticks/${tick}/approved-transactions`);
    console.log("resp", response.status);
    const res = await response.json();

    console.log("result", res);
}

async function verifyTx(tx){
    const response = await fetch(`https://testapi.qubic.org/v1/ticks/${tx}/approved-transactions`);
    console.log("resp", response.status);
    const res = await response.json();

    console.log("result", res);
}

//verifyTx("zayvdldairwwecapgelwfeltvavevehjqpxlybqvcdnngphxdeuukolgglva");
blockTransactions(13114682);

