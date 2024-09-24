/*
* Example for incoming transactions
*/

const baseURL = "https://rpc.qubic.org"

const QUTIL_ADDRESS = "EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVWRF"

const depositAccount = "YOURIDENTITY"


function handleDeposit(senderID, transactionID, amount, sendMany) {

    // Insert business logic here
    console.log("Got from [" + senderID + "] " + amount + " QU. TX ID: " + transactionID + " SM: " + sendMany)

}


async function fetchLatestTick() {
    const response = await fetch(baseURL + "/v1/status", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
    const data = await response.json()
    return data["lastProcessedTick"]["tickNumber"]
}

async function fetchTickTransactions(tick) {
    // Only fetch approved transfers
    const response = await fetch(baseURL + "/v2/ticks/" + tick + "/transactions?transfers=true&approved=true", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
    const data = await response.json()
    return data["transactions"]
}

async function fetchSendManyTransaction(transactionID) {

    const response = await fetch(baseURL + "/v2/transactions/" + transactionID + "/sendmany", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
    return await response.json()
}

async function main() {

    // Fetch latest tick
    const latestTick = await fetchLatestTick()

    // Fetch transactions
    const transactions = await fetchTickTransactions(latestTick)

    for (const tx of transactions) {
        const transaction = tx["transaction"]


        //console.log(transaction)
        // Handle send many transaction (check if deposit address is recipient of one of the send many entries)
        if (transaction["destId"] === QUTIL_ADDRESS && transaction["inputType"] === 1 && transaction["inputSize"] === 1000) { // This is how we determine if a transaction is of send many type
            // Fetch the deserialized send many transaction
            const sendManyTransaction = await fetchSendManyTransaction(transaction["txId"])
            for (const transfer of sendManyTransaction["transaction"]["transfers"]) {
                if (transfer["destId"] === depositAccount) {
                    handleDeposit(sendManyTransaction["transaction"]["sourceId"], sendManyTransaction["transaction"]["txId"], transfer["amount"], true);
                }
            }
        }
    }
}

await main()