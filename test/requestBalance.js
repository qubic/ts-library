const { QubicConnector } = require('../dist/QubicConnectorNode');
const { QubicEntityResponse } = require('../dist/qubic-communication/QubicEntityResponse');
const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicEntity } = require('../dist/qubic-types/QubicEntity');
const { QubicPackageType } = require('../dist/qubic-communication/QubicPackageType');

// List of IDs to request balances for
const ids = ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"];

// Address of the peer to connect to
const peerAddress = "65.109.66.49";
let receivedBalances = 0;
let totalValue = 0;
let start = new Date();

// Create a new QubicConnector instance
const connector = new QubicConnector();

// Event handler for receiving balance information
connector.onBalance = (b) => {
  // Check if the balance information is valid
  if (b && b.entity && b.entity.incomingAmount && b.entity.outgoingAmount) {
    // Add the balance to the total value
    totalValue += b.entity.getBalance();
  }
  receivedBalances++;
  // If all balances have been received, destroy the connector
  if (receivedBalances >= ids.length) {
    connector.destroy();
  }
};

// Event handler for when a peer is connected
connector.onPeerConnected = () => {
  console.log("connected");
  // Request balance for each ID
  ids.forEach(id => {
    connector.requestBalance(new PublicKey(id));
  });
};

// Event handler for receiving a package
connector.onPackageReceived = (p) => {
  // Check if the package is a response entity
  if (p.header.type == QubicPackageType.RESPOND_ENTITY) {
    const entityResponse = new QubicEntityResponse().parse(p.payLoad);
    console.log("BALANCE", entityResponse.entity.getBalance());
  }
};

// Event handler for when a peer is disconnected
connector.onPeerDisconnected = () => {
  const duration = new Date() - start;
  console.log(`Received ${receivedBalances} of ${ids.length} balances with total value of ${totalValue} $QUBICS in ${duration} milliseconds`);
  console.log("disconnected");
};

// Event handler for when the connector is ready
connector.onReady = (p) => {
  console.log("ready", p);
};

// Event handler for receiving a tick
connector.onTick = (p) => {
  console.log("tick received", p);
};

// Connect to the peer address
connector.connect(peerAddress);

// todo: timeout

