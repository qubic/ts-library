

const { QubicConnector } = require('../dist/QubicConnectorNode');
const { QubicEntityResponse } = require('../dist/qubic-communication/QubicEntityResponse');
const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicEntity } = require('../dist/qubic-types/QubicEntity');
const { QubicPackageType } = require('../dist/qubic-communication/QubicPackageType');
const { QubicHelper } = require('../dist/qubicHelper');
const { QubicTransaction } = require('../dist/qubic-types/QubicTransaction');
const { RequestResponseHeader } = require('../dist/qubic-communication/RequestResponseHeader');
const { QubicPackageBuilder } = require('../dist/QubicPackageBuilder');
const fs = require("fs");


/***
 * represents a mock user
 */
class User {
  constructor(id) {
    this.id = id;
    this.fixedDepositAddress = new PublicKey();
  }
  id;
  balance = 0;
  depositWallet;
  tempDepositWallet;
  tempWithdrawWallet;
  withdrawAddress;

  tempDepositTx; // TxWatch // holds the current tx responsible for deposit
  tempWithdrawTx; // TxWatch // holds the current tx responsible for withdraw

}

/**
 * is a peer connect to
 */
class Peer {
  ip;
  valid; // use this to mark a bad peer. (e.g. connections refused)

  constructor(ip) {
    this.ip = ip;
    this.valid = true;
  }
}

/**
 * a wallet to hold all infos
 */
class Wallet {

  constructor() {
  }

  balance;
  seed;
  privateKey;
  publicKey;
  publicId;

  async createWallet(seed) {
    this.seed = seed;
    this.balance = 0;
    await new QubicHelper().createIdPackage(seed).then(p => {
      this.privateKey = p.privateKey;
      this.publicKey = new PublicKey(p.publicKey);
      this.publicId = p.publicId;
    });
    return this;
  }
  createWalletSync(seed) {
    this.seed = seed;
    this.balance = 0;
    new QubicHelper().createIdPackage(seed).then(p => {
      this.privateKey = p.privateKey;
      this.publicKey = new PublicKey(p.publicKey);
      this.publicId = p.publicId;
    });
    return this;
  }
}

/**
 * used to overwatch a tx.
 */
class TxWatch {
  constructor(tick, digest, sourcePublicKey, destPublicKey, amount) {
    this.tick = tick;
    this.digest = digest;
    this.sourcePublicKey = sourcePublicKey;
    this.destinationPulicKey = destPublicKey;
    this.amount = amount;
  }
  digest;
  tick;
  sourcePublicKey;
  destinationPulicKey;
  amount;
  success = false;
}

/**
 * 
 * a sample class to simulate a qubic exchange integration
 * 
 */
class QubicExchange {

  // events
  onLoaded;

  configPath = "exchange.json";
  tickAddition = 5; // amount of ticks added in advance to send a tx

  config = {
    hotWallet: new Wallet(),
    lastProcessedTick: 0,
    users: [],// our hot wallets where we store our qubics
    // trusted peers we use to query and send transactions
    trustedPeers: [
      new Peer("167.235.118.235"),
      new Peer("135.181.246.49"),
      new Peer("148.251.184.163"),
      new Peer("91.210.226.146")]
  }

  tickConnector; // the main connector to qubic (receives ticks)
  tickerInterval; // used to store the console logger interval
  configSavingState = false;

  // to store the current tick, this is our reference
  currentTick = 0;

  // state to keep ready state of exchange
  isReady = false;

  constructor(onLoadedCallbackFn) {
    if (onLoadedCallbackFn)
      this.onLoaded = onLoadedCallbackFn;

    this.loadConfig();
  }

  /**
   * simulated storage load
   */
  async loadConfig() {
    if (fs.existsSync(this.configPath)) {
      try {
        const configString = fs.readFileSync(this.configPath);
        this.config = JSON.parse(configString);

        // hack for uin8 arrays
        // need to recreate wallets because of serialization of uint8 which is wrong
        this.config.users.forEach(user => {
          user.depositWallet = new Wallet().createWalletSync(user.depositWallet.seed);

          if (user.tempDepositWallet)
            user.tempDepositWallet = new Wallet().createWalletSync(user.tempDepositWallet.seed);

          if (user.tempWithdrawWallet)
            user.tempWithdrawWallet = new Wallet().createWalletSync(user.tempWithdrawWallet.seed);
        });

        // als recreate hot wallet
        this.config.hotWallet = await new Wallet().createWallet(this.config.hotWallet.seed);

        this.log("Existing Configuration loaded", this.config);
      } catch (e) {
        this.logError("Configuration cannot be loaded", e);
        return;
      }
    } else {
      // create a sample Configuration with two users
      this.config.users.push(await this.createUser());
      this.config.users.push(await this.createUser());
      this.config.hotWallet = await new Wallet().createWallet(this.seedGen());
      this.saveConfig();
      this.log("NEW Exchange Config with two Mock Users created. Save your seeds!")
    }
    if (this.onLoaded)
      this.onLoaded();

    // wait a second to finish not well coded async processes
    setTimeout(() => {
      this.log("Exchange is Ready")
      this.log("Loaded CONFIG", this.config);
      this.isReady = true;
    }, 1000);
  }

  /**
   * simulated storage save
   */
  saveConfig() {
    if (this.configSavingState)
      return;

    this.configSavingState = true;
    const jsonData = JSON.stringify(this.config);
    fs.writeFile(this.configPath, jsonData, () => {
      // ignore
      this.configSavingState = false;
    });
  }

  log(message) {
    console.log(message);
  }

  logError(message, ...logData) {
    console.error(message, logData);
  }

  /**
   * generates a new seed
   * 
   * @returns 
   * 
   */
  seedGen() {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const letterSize = letters.length;
    let seed = "";
    for (let i = 0; i < 55; i++) {
      seed += letters[Math.floor(Math.random() * letterSize)];
    }
    return seed;
  }


  /**
   * creates a mock user
   * 
   * @returns 
   */
  async createUser() {
    const user = new User(this.config.users.length + 1);
    user.depositWallet = await new Wallet().createWallet(this.seedGen());
    return user;
  }

  /**
   * gets a random peer to connect to from trusted peer list
   * 
   * @returns 
   */
  getRandomPeer() {
    const candidates = this.config.trustedPeers.filter(f => f.valid);
    const electedCandidateIndex = Math.floor(Math.random() * candidates.length);
    return candidates[electedCandidateIndex];
  }

  /**
   * checks for what you want to get balances
   * 
   */
  checkBalances() {
    // here you could also use an other instance of qubic connector

    // request balances for deposit addresses
    let ids = this.config.users.map(m => m.depositWallet.publicId);

    // request balances for tempDeposit 
    ids = ids.concat(this.config.users.filter(f => f.tempDepositWallet).map(m => m.tempDepositWallet.publicId));

    // request balances for tempWithdraw
    ids = ids.concat(this.config.users.filter(f => f.tempWithdrawWallet).map(m => m.tempWithdrawWallet.publicId));
    ids = ids.filter((value, index, array) => array.indexOf(value) === index);

    // add hot wallet to know that balance too
    ids.push(this.config.hotWallet.publicId);

    // only request distinct balances
    ids.forEach(id => {
      this.tickConnector.requestBalance(new PublicKey(id));
    });
  }

  /**
   * is called when new tick
   * @param {*} tick 
   */
  setTick(tick) {
    this.currentTick = tick;

    this.checkBalances();
  }

  /**
   * create a tx
   * 
   * @param {*} tick 
   * @param {*} sourcePublicKey 
   * @param {*} destinationPublicKey 
   * @param {*} amount 
   * @param {*} signSeed 
   * @returns 
   */
  async createAndSendTransfer(sourcePublicKey, destinationPublicKey, amount, signSeed) {

    // build and sign tx
    const tx = new QubicTransaction().setSourcePublicKey(sourcePublicKey)
      .setDestinationPublicKey(destinationPublicKey)
      .setAmount(amount)
      .setTick(this.currentTick + this.tickAddition);
    await tx.build(signSeed);

    const txWatch = new TxWatch(tx.tick, tx.digest, tx.sourcePublicKey, tx.destinationPublicKey, Number(tx.amount.getNumber()));

    this.log("SEND TX for " + tx.tick + " Amount: " + amount);

    // send tx
    const header = new RequestResponseHeader(QubicPackageType.BROADCAST_TRANSACTION, tx.getPackageSize())
    const builder = new QubicPackageBuilder(header.getSize());
    builder.add(header);
    builder.add(tx);
    const data = builder.getData();
    this.tickConnector.sendPackage(data);

    return txWatch;
  }

  /**
   * first steop of deposit processing
   * 
   * @param {*} user 
   * @param {*} entityResponse 
   */
  async processDeposit(user, entityResponse) {
    // todo: locking of resources
    if (user && entityResponse.entity.getBalance() > 0) {
      // here we got a deposit => transfer it to our temp deposit address
      if (!user.tempDepositWallet) {
        // only proceed if there is not already a deposit processing running, otherwise just wait
        user.tempDepositWallet = await new Wallet().createWallet(this.seedGen());

        user.tempDepositTx = await this.createAndSendTransfer(user.depositWallet.publicKey, user.tempDepositWallet.publicKey, entityResponse.entity.getBalance(), user.depositWallet.seed);

        this.saveConfig();
      }
    }
  }

  /**
   * process withdraw
   * 
   * @param {*} user 
   * @param {*} entityResponse 
   */
  async processTempWithdraw(user, entityResponse) {
    if (user.tempWithdrawTx.tick < entityResponse.tick) {
      if (user.tempWithdrawTx.success) {
        if (entityResponse.entity.getBalance() == 0) {
          // success. withdraw finished
          user.balance -= user.tempWithdrawTx.amount;
          user.tempWithdrawTx = undefined;
          user.tempWithdrawWallet = undefined;
        } else {
          // transfer from hot to temp withdraw account success, send qubic to users address
          const txWatch = await this.createAndSendTransfer(user.tempWithdrawWallet.publicKey, new PublicKey(user.withdrawAddress), user.tempWithdrawTx.amount, user.tempWithdrawWallet.seed);
          txWatch.success = true;
          user.tempWithdrawTx = txWatch;
        }
      } else if (entityResponse.entity.getBalance() >= user.tempWithdrawTx.amount) {
        // withdraw is on temp account, sent to user
        user.tempWithdrawTx.success = true;
      } else {
        // tx failed, resent it
        user.tempWithdrawTx = await this.createAndSendTransfer(this.config.hotWallet.publicKey, user.tempWithdrawWallet.publicKey, user.tempWithdrawTx.amount, this.config.hotWallet.seed);
      }
      this.saveConfig();
    }
  }

  /**
   * processes the temp deposits
   * this is step 2 of the deposit process
   * 
   * @param {*} user 
   * @param {*} entityResponse 
   */
  async processTempDeposit(user, entityResponse) {
    if (user.tempDepositTx.tick < entityResponse.tick) {
      // if balance has not increased. tx failed repeat
      if (user.tempDepositTx.success) {
        if (entityResponse.entity.getBalance() == 0) {
          // deposit process finished here
          // remove temp stuff
          user.tempDepositTx = undefined;
          user.tempDepositWallet = undefined;
        } else {
          // increase users balance
          user.balance += txWatch.amount;

          // send the deposit to the hot wallet
          var txWatch = await this.createAndSendTransfer(user.tempDepositWallet.publicKey, this.config.hotWallet.publicKey, entityResponse.entity.getBalance(), user.tempDepositWallet.seed);
          txWatch.success = true;
          user.tempDepositTx = txWatch;
        }
      } else if (user.tempDepositTx.amount > entityResponse.entity.getBalance()) {
        // resent tx. because it didn't work
        user.tempDepositTx = await this.createAndSendTransfer(user.depositWallet.publicKey, user.tempDepositWallet.publicKey, user.tempDepositTx.amount, user.depositWallet.seed);
      } else {
        // transfer from users deposit account to temp deposit was successful
        user.tempDepositTx.success = true;
      }
      this.saveConfig();
    }
  }

  /**
   * is called when a new balance has recevied
   * @param {*} entityResponse 
   * @returns 
   */
  receivedBalance(entityResponse) {

    if (entityResponse.tick < this.currentTick) // ignore reports for lower ticks
      return;

    const depositUser = this.config.users.find(f =>
      // received balance for deposit address
      entityResponse.entity.publicKey.equals(f.depositWallet.publicKey)

    );

    if (depositUser)
      this.processDeposit(depositUser, entityResponse);

    const tempDepositUser = this.config.users.find(f =>
      // received balance for temp deposit
      f.tempDepositWallet && entityResponse.entity.publicKey.equals(f.tempDepositWallet.publicKey)

    );

    if (tempDepositUser)
      this.processTempDeposit(tempDepositUser, entityResponse);

    const tempWithdrawUser = this.config.users.find(f =>
      // received balance for withdraw
      f.tempWithdrawWallet && entityResponse.entity.publicKey.equals(f.tempWithdrawWallet.publicKey)
    );
    if (tempWithdrawUser)
      this.processTempWithdraw(tempWithdrawUser, entityResponse);

    if (entityResponse.entity.publicKey.equals(this.config.hotWallet.publicKey))
      this.config.hotWallet.balance = entityResponse.entity.getBalance();

  }

  initTickerConnection() {
    this.tickConnector = new QubicConnector();
    this.tickConnector.onTick = (p) => {
      // a new tick has arrived
      if (this.currentTick < p) {
        this.setTick(p);
      }
    }
    this.tickConnector.onPeerConnected = () => {
      // do anything when a new connection to a peer is established
    }
    this.tickConnector.onPeerDisconnected = () => {
      // here you can do anything when a peer is disconnected (the library has autoconnect; therefore not needed here)
    }
    this.tickConnector.onBalance = (entityResponse) => {
      this.receivedBalance(entityResponse);
    }
    this.tickConnector.onSocketError = () => {
      // recreate the connector. connect to another peer
      this.tickConnector.destroy();
      this.initTickerConnection();
    }
    this.tickConnector.connect(this.getRandomPeer().ip);
  }

  /**
   * central ticker
   */
  ticker() {
    const totalExchangeValue = this.config.users.reduce((a, c) => a += c.balance, 0);
    const pendingDeposits = this.config.users.reduce((a, c) => a += c.tempDepositTx ? 1 : 0, 0)
    const pendingWithdraw = this.config.users.reduce((a, c) => a += c.tempWithdrawTx ? 1 : 0, 0)
    this.log(`QEXCHANGE | Tick: ${this.currentTick} | HotBalance: ${this.config.hotWallet.balance} | Users: ${this.config.users.length} | Pending Deposits: ${pendingDeposits} |  Pending Withdraw: ${pendingWithdraw}`);
    this.tickConnector.requestTickInfo();
  }

  /**
   * starts the exchange engine
   */
  startExchange() {
    if (!this.isReady) {
      this.log(`Wait for ready state`);
      setTimeout(() => {
        this.startExchange();
      }, 1000);
    } else {
      this.log(`Start Qubic Exchange`);
      this.initTickerConnection();
      this.tickerInterval = setInterval(() => {
        this.ticker();
      }, 1000);
    }
  }

  /**
   * stops the engine
   */
  stopExchange() {
    this.log(`Stop Qubic Exchange`);
    this.tickConnector.destroy();
    this.saveConfig();
  }


  async startWithdraw(user, amount) {

    if (this.config.hotWallet.balance < amount) {
      this.logError("INSUFFICIENT FUND ON HOT WALLET");
      return;
    }

    if (!user.tempWithdrawWallet) {
      // initiate step one
      user.tempWithdrawWallet = await new Wallet().createWallet(this.seedGen());
      user.tempWithdrawTx = await this.createAndSendTransfer(this.config.hotWallet.publicKey, user.tempWithdrawWallet.publicKey, amount, this.config.hotWallet.seed);
    } else {
      // wait for previous withdraw
      this.logError("ONLY ONE WITHDRAW ALLOWED")
    }

    this.saveConfig();
  }


  /***
   * simulates a withdraw
   */
  simulateWithdraw(userId, amount) {
    const user = this.config.users.find(f => f.id === userId);
    if (!user) {
      this.logError("USER NOT FOUND");
      return;
    }

    if (user.balance < amount) {
      this.logError("NOT ENOUGH BALANCE");
      return;
    }

    this.startWithdraw(user, amount);
  }
}


// create exchange
const exchange = new QubicExchange();
exchange.startExchange();


// simulate a withdraw
// setTimeout(() => {
//   // send a test withdraw after 5 seconds
//   exchange.simulateWithdraw(1, 1);
// }, 5000);
