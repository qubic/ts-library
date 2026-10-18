import { QubicPackageType } from "./qubic-communication/QubicPackageType";
import { ReceivedPackage } from "./qubic-communication/ReceivedPackage";
import { RequestResponseHeader } from "./qubic-communication/RequestResponseHeader";
import * as net from 'net';
import { QubicTickInfo } from "./qubic-types/QubicTickInfo";
import { QubicEntityResponse } from "./qubic-communication/QubicEntityResponse";
import { PublicKey } from "./qubic-types/PublicKey";
import { QubicPackageBuilder } from "./QubicPackageBuilder";
import { QubicEntityRequest } from "./qubic-communication/QubicEntityRequest";
import crypto from './crypto'
import { KeyHelper } from "./keyHelper";

export class QubicConnectorNode {

    private PORT = 21841;

    private socket: net.Socket | undefined;

    private peerConnected = false;
    private connectedPeerAddress: string | undefined; // the peer we are connected to
    private buffer: Uint8Array = new Uint8Array(4 * 1024 * 1024);
    private bufferWritePosition: number = 0;
    private bufferReadPosition: number = 0;
    private currentTick = 0;
    private timer;

    public onReady?: () => void
    public onPeerConnected?: () => void
    public onPeerDisconnected?: () => void
    public onBalance?: (entity: QubicEntityResponse) => void;
    public onTick?: (tick: number) => void
    public onPackageReceived?: (packet: ReceivedPackage) => void
    public onSocketError?: (packet: any) => void

    constructor(PORT = 21841) {
        this.socket = new net.Socket();
        this.PORT = PORT;
        if (this.socket) {
            this.socket.on('data', (d: any) => {
                this.writeBuffer(d);
            });
            this.socket.on('close', (d: any) => {
                if (this.onPeerDisconnected)
                    this.onPeerDisconnected();
            });
            this.socket.on('error', (er: any) => {
                if (this.onSocketError)
                    this.onSocketError(er);
            });
        }

    }

    private onPeerConnect() {
        this.peerConnected = true;
        if (this.onPeerConnected)
            this.onPeerConnected();
    }

    private toBase64(u8: any): string {
        return btoa(String.fromCharCode.apply(null, u8));
    }

    private connectPeer(ipAddress: string): boolean {

        try {
            this.socket?.connect(this.PORT, ipAddress, () => {
                this.onPeerConnect();
            });

            this.connectedPeerAddress = ipAddress;
            return true;
        } catch (e) {
            console.error("ERROR in Socket Connection", e);
        }

    }
    private disconnectPeer(): void {
        if (this.connectedPeerAddress) {

            this.socket?.destroy();

            this.connectedPeerAddress = undefined;
            this.peerConnected = false;
        }
    }

    private reconnectPeer(): boolean {
        this.disconnectPeer(); // disconnect
        if (this.connectedPeerAddress) {
            return this.connectPeer(this.connectedPeerAddress); // conncet
        }
        return false;
    }

    private writeBuffer(data: Uint8Array) {
        //console.log("writeBuffer", data);
        let writeLength = data.length;
        if (this.bufferWritePosition + data.length > this.buffer.length)
            writeLength = this.buffer.length - this.bufferWritePosition;

        this.buffer.set(data.slice(0, writeLength), this.bufferWritePosition);
        this.bufferWritePosition += writeLength;

        if (writeLength < data.length) {
            this.bufferWritePosition = 0;
            this.buffer.set(data.slice(writeLength, data.length))
            this.bufferWritePosition += data.length - writeLength;
        }

        this.processBuffer();
    }

    private readFromBuffer(numberOfBytes: number, setReadPosition: boolean = false): Uint8Array {

        const extract = new Uint8Array(numberOfBytes);
        if (this.bufferReadPosition + numberOfBytes <= this.buffer.length) {
            const readBytes = this.buffer.slice(this.bufferReadPosition, this.bufferReadPosition + numberOfBytes);
            //console.log("BUFFER READ " + this.bufferReadPosition + " - " + numberOfBytes, readBytes);
            extract.set(readBytes);
        }
        else {
            extract.set(this.buffer.slice(this.bufferReadPosition));
            extract.set(this.buffer.slice(0, this.bufferReadPosition + numberOfBytes - this.buffer.length));
        }
        if (setReadPosition)
            this.setReadPosition(numberOfBytes);

        return extract;
    }

    private setReadPosition(numberOfReadByts: number) {
        if (this.bufferReadPosition + numberOfReadByts > this.buffer.length)
            this.bufferReadPosition = 0 + (this.bufferReadPosition + numberOfReadByts - this.buffer.length)
        else
            this.bufferReadPosition += numberOfReadByts;
    }

    private processBuffer() {
        while (true) {
            const toReadBytes = Math.abs(this.bufferWritePosition - this.bufferReadPosition);
            if (toReadBytes < 8) /* header size */ {
                break;
            }

            // read header
            const header = new RequestResponseHeader();
            header.parse(this.readFromBuffer(8 /* header size */));
            if (header === undefined || toReadBytes < header?.getSize()) {
                //console.log("NOT ENOUGH BYTES FOR COMPLETE PACKAGE");
                break;
            }

            this.setReadPosition(header.getPackageSize());
            const recPackage = new ReceivedPackage();
            recPackage.header = header;
            recPackage.ipAddress = this.connectedPeerAddress ?? "";
            if (header.getSize() > 8) {
                recPackage.payLoad = this.readFromBuffer(header.getSize() - header.getPackageSize(), true);
            } else {
                recPackage.payLoad = new Uint8Array(0);
            }
            this.processPackage(recPackage);
            if (this.onPackageReceived)
                this.onPackageReceived(recPackage);
        }
    }

    private processPackage(p): void {
        if (p.header.getType() == QubicPackageType.RESPOND_CURRENT_TICK_INFO) {
            const tickInfo = new QubicTickInfo().parse(p.payLoad);
            if (tickInfo && this.currentTick < tickInfo.getTick()) {
                this.currentTick = tickInfo.getTick();
                if (this.onTick)
                    this.onTick(this.currentTick);
            }

        } else if (p.header.getType() == QubicPackageType.RESPOND_ENTITY && this.onBalance) {
            const entityResponse = new QubicEntityResponse().parse(p.payLoad);
            this.onBalance(entityResponse);
        }
    }

    private requestTickInfo() {
        if (this.peerConnected) {
            const header = new RequestResponseHeader(QubicPackageType.REQUEST_CURRENT_TICK_INFO)
            header.randomizeDejaVu();
            this.sendPackage(header.getPackageData());
        }
    }

    public requestBalance(pkey: PublicKey): void {
        if (!this.peerConnected)
            return;
        const header = new RequestResponseHeader(QubicPackageType.REQUEST_ENTITY, pkey.getPackageSize())
        header.randomizeDejaVu();
        const builder = new QubicPackageBuilder(header.getSize());
        builder.add(header);
        builder.add(new QubicEntityRequest(pkey));
        const data = builder.getData();
        this.sendPackage(data);
    }

    public GetPrivatePublicKey(seed): Promise<{ privateKey, publicKey }> {
        return crypto.then(({ schnorrq, K12 }) => {
            const keyHelper = new KeyHelper();

            const privateKey = keyHelper.privateKey(seed, 0, K12);
            const publicKey = keyHelper.createPublicKey(privateKey, schnorrq, K12);

            return { privateKey, publicKey };
        });
    }

    private initialize(): void {
        this.bufferReadPosition = 0;
        this.bufferWritePosition = 0;

        // start tick info interval to get current tick regularly
        this.timer = setInterval(() => {
            this.requestTickInfo();
        }, 500)



        if (this.onReady)
            this.onReady();

    }

    /**
     * connects to a specific peer
     * @param ip node/peer ip address
     */
    public connect(ip: string): void {

        this.connectPeer(ip);

    }

    public sendPackage(data: Uint8Array): boolean {

        return this.sendTcpPackage(data);

    }

    private sendTcpPackage(data: Uint8Array): boolean {
        if (!this.peerConnected) {
            return false;
        }
        this.socket?.write(data);

        return true;
    }

    /**
     * starts the connection
     */
    public start(): void {
        this.initialize();
    }
    /**
     * stops the web bridge ws connection
     */
    public stop(): void {
        clearInterval(this.timer);
        this.disconnectPeer();
    }

    public destroy(): void {
        this.stop();
        if (this.socket)
            this.socket.destroy(); // untested!
    }
}