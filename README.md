# Qubic Typescript Library

A TS Library to communicate with the Qubic Network.

## Overview

The Qubic Typescript Library is designed to facilitate communication with the Qubic Network. It provides various utilities and classes to interact with the network, manage cryptographic operations, and handle data structures specific to Qubic.

[Qubic TS Library on NPM](https://www.npmjs.com/package/@qubic-lib/qubic-ts-library)

## Installation

Install via NPM.

```bash
yarn add @qubic-lib/qubic-ts-library
```

## Usage
### Importing the Library
To use the library, you need to import the necessary classes and functions. Below is an example of how to import and use the `QubicHelper` class.


```ts
// import helper
import { QubicHelper } from 'qubic-ts-library/dist/qubicHelper'

// create an id Package with private/public key and human readable address
const id = await helper.createIdPackage("alsdjflasjfdlasdjflkasdjflasdjlkdjsf");
```


### Components

The library is composed of several key components, each serving a specific purpose:

1. **QubicConnector**: Manages the connection to the Qubic Network.
2. **QubicDefinitions**: Contains definitions and constants used throughout the library.
3. **QubicHelper**: Provides helper functions for cryptographic operations and ID management.
4. **QubicPackageBuilder**: Assists in building packages for communication with the network.
5. **DynamicPayload**: Represents dynamic payloads used in transactions.
6. **Long**: Handles long integer operations.
7. **PublicKey**: Manages public key operations.
8. **QubicEntity**: Represents entities within the Qubic Network.
9. **QubicTickData**: Handles tick data structures.
10. **QubicTickInfo**: Manages tick information.
11. **QubicTransaction**: Represents transactions on the network.
12. **Signature**: Manages digital signatures.
13. **QubicTransferAssetPayload**: Handles asset transfer payloads.
14. **QubicTransferSendManyPayload**: Manages payloads for sending multiple transfers.

### Building the Library

To build the library into a single JavaScript file, use the following commands:

```
yarn install
yarn webpack
```

## Node Sample Applications

### requestBalance.js
Test how to receive Balance from Network

1. Add the IDs to `const ids = ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"];` in the file `test/requestBalance.js`.
2. Run the following commands:

```bash
yarn install
tsc
node test/requestBalance.js
```

#### sample-exchange.js

A lightweight sample of an exchange integration with Qubic. It can manage multiple users and handle deposits/withdrawals to one hot wallet.

> This implementation is meant for demo purposes only!

To run the sample exchange:

```bash
yarn install
tsc
node test/sample-exchange.js
```

The Exchange initializes itsself. Start it and it will create a file `exchange.json`. There you can find the Seeds used. If you do tests, save them anywhere.

## Testing
Run tests with

```bash
yarn run test
```

## Publish
publish with.

```bash
yarn build
yarn publish --access public
```

## LICENSE
All Qubic Software is licensed unter the Anti Military License: https://github.com/qubic-network/license