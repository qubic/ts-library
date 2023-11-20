

const { QubicConnector } = require('../dist/QubicConnectorNode');
const { QubicEntityResponse } = require('../dist/qubic-communication/QubicEntityResponse');
const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicEntity } = require('../dist/qubic-types/QubicEntity');
const { QubicPackageType } = require('../dist/qubic-communication/QubicPackageType');

const ids = ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"];

const peerAddress = "135.181.246.49";
let receivedBalances = 0;
let totalValue = 0;
let start = new Date();

const connector = new QubicConnector();
connector.onBalance = (b) => {
  //console.log("Balance", b.entity);
  if (b && b.entity && b.entity.incomingAmount && b.entity.outgoingAmount) {
    totalValue += b.entity.getBalance();
  }
  receivedBalances++;
  if (receivedBalances >= ids.length) {
    connector.destroy();
  }
};
connector.onPeerConnected = () => {
  console.log("connected");
  ids.forEach(id => {
    connector.requestBalance(new PublicKey(id));
  });
}
connector.onPackageReceived = (p) => {

  if (p.header.type == QubicPackageType.RESPOND_ENTITY) {
    const entityResponse = new QubicEntityResponse().parse(p.payLoad);
    console.log("BALANCE", entityResponse.entity.getBalance());
  }
}
connector.onPeerDisconnected = () => {
  const duration = new Date() - start;
  console.log(`Received ${receivedBalances} of ${ids.length} balances with total value of ${totalValue} $QUBICS in ${duration} miliseconds`);
  console.log("disconnected");
}
connector.onReady = (p) => {
  console.log("ready", p);
}
connector.onTick = (p) => {
  console.log("tick received", p);
}

connector.connect(peerAddress);

// todo: timeout

