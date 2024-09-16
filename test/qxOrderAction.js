const {QubicTransferQXOrderPayload} = require("../dist/qubic-types/transacion-payloads/QubicTransferQXOrderPayload")
const {PublicKey} = require("../dist/qubic-types/PublicKey")
const {Long} = require("../dist/qubic-types/Long")
const {QubicTransaction} = require("../dist/qubic-types/QubicTransaction")
const {QubicDefinitions} = require("../dist/QubicDefinitions")

const senderIdentity = ""
const senderSeed = ""

// CFB asset
const assetIssuer = "CFBMEMZOIDEXQAUXYYSZIURADQLAPWPMNJXQSNVQZAHYVOPYUKKJBJUCTVJL"
const assetName= 4343363

const assetPrice = 20
const assetQuantity = 1


const targetTick = 15923820

const broadcastTransactionURL = "https://rpc.qubic.org/v1/broadcast-transaction"

async function main() {

    const transaction = await createQXOrderTransfer(new PublicKey(senderIdentity), senderSeed, "BUY");

    const encodedTransaction = transaction.encodeTransactionToBase64(transaction.getPackageData())

    const response = await fetch(broadcastTransactionURL,
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
        })

    const data = await response.json()
    console.log(data)

    if (response.status !== 200) {
        throw new Error("Request returned a non 200 status code: " + response.status)
    }

    return data

}

async function createQXOrderTransfer(sourcePublicKey, signSeed, action) {

    const qxOrderPayload = new QubicTransferQXOrderPayload(
        {
            issuer: new PublicKey(assetIssuer),
            assetName: new Long(assetName),
            price: new Long(assetPrice),
            numberOfShares: new Long(assetQuantity)

        }
    )
    const totalAmount = qxOrderPayload.getTotalAmount()

    const transaction = new QubicTransaction()
        .setSourcePublicKey(sourcePublicKey)
        .setDestinationPublicKey(QubicDefinitions.QX_ADDRESS)
        .setTick(targetTick)
        .setInputSize(qxOrderPayload.getPackageSize())
        .setPayload(qxOrderPayload);

    switch (action) {
        case "SELL":
            transaction.setInputType(QubicDefinitions.QX_ADD_ASK_ORDER)
            transaction.setAmount(new Long(0))
            break
        case "BUY":
            transaction.setInputType(QubicDefinitions.QX_ADD_BID_ORDER)
            transaction.setAmount(new Long(totalAmount))
            break;
        case "CANCEL_SELL":
            transaction.setInputType(QubicDefinitions.QX_REMOVE_ASK_ORDER)
            transaction.setAmount(new Long(0))
            break;
        case "CANCEL_BUY":
            transaction.setInputType(QubicDefinitions.QX_REMOVE_BID_ORDER)
            transaction.setAmount(new Long(0))
            break;
    }

    await transaction.build(signSeed)

    return transaction;
}

const data = main()
console.log(data)