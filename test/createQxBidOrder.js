import {QubicTransferQXOrderPayload} from "../dist/qubic-types/transacion-payloads/QubicTransferQXOrderPayload.js";
import {PublicKey} from "../dist/qubic-types/PublicKey.js";
import {Long} from "../dist/qubic-types/Long.js";
import {QubicTransaction} from "../dist/qubic-types/QubicTransaction.js";
import {QubicDefinitions} from "../dist/QubicDefinitions.js";


/*
* Example for creating a BID transaction on QX
*/

//Api parameters
const baseURL = "https://rpc.qubic.org"
const transactionBroadcastTickOffset = 10

// Asset information
const CFBAssetIssuer = "CFBMEMZOIDEXQAUXYYSZIURADQLAPWPMNJXQSNVQZAHYVOPYUKKJBJUCTVJL"
const CFBAssetNameValue = valueOfAssetName("CFB")

// Desired price and quantity
const assetPrice = 4
const assetQuantity = 1

// Buyer information
const identity = "ERONFATIXCRBZBIVKOBVIIVPPZKCGYYWOUVFDCKJACOTDVVUDEAEVHWCRAFM"
const seed = "wxwedjpzgqbpvsuotzkuaquigiizopzxueipuhmhnvuhjeetlsjuvlm"


function valueOfAssetName(assetName) {

    const bytes = new Uint8Array(8)
    bytes.set(new TextEncoder().encode(assetName))

    return new DataView(bytes.buffer).getInt32(0, true)
}

async function fetchLastTick(){
    const response =  await fetch(baseURL + "/v1/status", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })

    const data = await response.json()
    return data["lastProcessedTick"]["tickNumber"]
}

function createQXOrderPayload(issuer, assetName, price, numberOfShares) {
    return new QubicTransferQXOrderPayload({
        issuer: new PublicKey(issuer),
        assetName: new Long(assetName),
        price: new Long(price),
        numberOfShares: new Long(numberOfShares),
    })
}

async function createQXOrderTransaction(senderId, senderSeed, targetTick, payload, actionType) {
    const transaction = new QubicTransaction()
        .setSourcePublicKey(new PublicKey(senderId))
        .setDestinationPublicKey(QubicDefinitions.QX_ADDRESS)
        .setTick(targetTick)
        .setInputSize(payload.getPackageSize())
        .setAmount(new Long(0))
        .setInputType(actionType)
        .setPayload(payload);

    if (actionType === QubicDefinitions.QX_ADD_BID_ORDER) {
        transaction.setAmount(new Long(payload.getTotalAmount()))
    }

    await transaction.build(senderSeed)

    return transaction;
}

async function broadcastTransaction(transaction) {

    const encodedTransaction = transaction.encodeTransactionToBase64(transaction.getPackageData())

    return await fetch(baseURL + "/v1/broadcast-transaction",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(
                {
                    encodedTransaction: encodedTransaction
                }
            )
        });
}

async function main() {

    //Get latest tick
    const latestTick = await fetchLastTick();

    //Assemble transaction payload
    const orderPayload = createQXOrderPayload(CFBAssetIssuer, CFBAssetNameValue, assetPrice, assetQuantity);

    //Assemble transaction
    const transaction = await createQXOrderTransaction(identity, seed, latestTick + transactionBroadcastTickOffset, orderPayload, QubicDefinitions.QX_ADD_BID_ORDER)

    //Broadcast transaction
    const res = await broadcastTransaction(transaction)
    console.log(await res.json())
    return "OK"
}

await main()

