const crypto = require('../dist/crypto')

async function main() {
    const {secRnd} = await crypto
    const randomNum = secRnd()
    console.log(randomNum)
}

main()