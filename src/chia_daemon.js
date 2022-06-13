import { randomBytes } from 'crypto';
import { WebSocket } from 'ws';
import { readFileSync } from 'fs';
import createRpcProxy from './rpc_proxy.js';
import { EventEmitter } from 'events';
import untildify from './untildify.js';

// this can be found in the config but for convenience
export let localDaemonConnection = {
    host: 'localhost',
    port: 55400,
    key_path: '~/.chia/mainnet/config/ssl/daemon/private_daemon.key',
    cert_path: '~/.chia/mainnet/config/ssl/daemon/private_daemon.crt',
    timeout_seconds: 30,
};

// this guy encapsulates asynchronous communication with the chia daemon
// which in turn proxies communication to the other chia services
class ChiaDaemon extends EventEmitter {
    constructor(connection, service_name = 'my_chia_app') {
        super();
        if (connection === undefined) {
            throw new Error('Connection meta data must be provided');
        }

        this.connection = connection;
        this.service_name = service_name;
        this.outgoing = new Map(); // outgoing messages awaiting a response
        this.incoming = new Map(); // incoming responses not yet consumed
    }

    get services() {
        return {
            daemon: createRpcProxy(this, 'daemon'),
            full_node: createRpcProxy(this, 'chia_full_node'),
            wallet: createRpcProxy(this, 'chia_wallet'),
            farmer: createRpcProxy(this, 'chia_farmer'),
            harvester: createRpcProxy(this, 'chia_harvester'),
            crawler: createRpcProxy(this, 'chia_crawler'),
        };
    }

    async connect(timeout_milliseconds = 1000) {
        if (this.ws !== undefined) {
            throw new Error('Already connected');
        }

        const address = `wss://${this.connection.host}:${this.connection.port}`;
        this.emit('connecting', address);

        const ws = new WebSocket(address, {
            rejectUnauthorized: false,
            key: readFileSync(untildify(this.connection.key_path)),
            cert: readFileSync(untildify(this.connection.cert_path)),
        });

        ws.on('open', () => {
            const msg = formatMessage('daemon', 'register_service', this.service_name, { service: this.service_name });
            ws.send(JSON.stringify(msg));
        });

        let connected = false;
        ws.on('message', (data) => {
            const msg = JSON.parse(data);

            if (this.outgoing.has(msg.request_id)) {
                this.outgoing.delete(msg.request_id);
                this.incoming.set(msg.request_id, msg);
            } else if (msg.command === 'register_service') {
                this.emit('connected');
                connected = true;
            } else {
                // received a socket message that was not a response to something we sent
                this.emit('event_message', msg);
            }
        });

        let error = false;
        ws.on('error', (e) => {
            this.emit('error', e);
            error = true;
        });

        ws.on('close', () => {
            this.emit('disconnected');
        });

        const timer = ms => new Promise(res => setTimeout(res, ms));
        const start = Date.now();

        // wait here until an incoming response shows up
        while (!error && !connected) {
            await timer(100);
            const elapsed = Date.now() - start;
            if (elapsed > timeout_milliseconds) {
                this.emit('error', new Error('Connection timeout expired'));
                break;
            }
        }

        if (!error && connected) {
            this.ws = ws;
        }
    }

    disconnect() {
        if (this.ws === undefined) {
            throw new Error('Not connected');
        }

        this.ws.close();
        this.ws = undefined;
        this.incoming.clear();
        this.outgoing.clear();
    }

    async sendCommand(destination, command, data) {
        if (this.ws === undefined) {
            throw new Error('Not connected');
        }

        const outgoingMsg = formatMessage(destination, command, this.service_name, data);

        this.outgoing.set(outgoingMsg.request_id, outgoingMsg);
        this.ws.send(JSON.stringify(outgoingMsg));

        const timer = ms => new Promise(res => setTimeout(res, ms));
        const start = Date.now();

        // wait here until an incoming response shows up
        while (!this.incoming.has(outgoingMsg.request_id)) {
            await timer(100);
            const elapsed = Date.now() - start;
            if (elapsed / 1000 > this.connection.timeout_seconds) {
                //clean up anything lingering for this message
                if (this.outgoing.has(outgoingMsg.request_id)) {
                    this.outgoing.delete(outgoingMsg.request_id);
                }
                if (this.incoming.has(outgoingMsg.request_id)) {
                    this.incoming.delete(outgoingMsg.request_id);
                }
                throw new Error('Timeout expired');
            }
        }

        const incomingMsg = this.incoming.get(outgoingMsg.request_id);
        this.incoming.delete(outgoingMsg.request_id);
        const incomingData = incomingMsg.data;
        if (incomingData.success === false) {
            throw new Error(incomingData.error);
        }
        return incomingData;
    }
}

function formatMessage(destination, command, origin, data = {}) {
    return {
        command: command,
        origin: origin,
        destination: destination,
        ack: false,
        request_id: randomBytes(32).toString('hex'),
        data: data,
    };
}

const _Chia = ChiaDaemon;
export { _Chia as ChiaDaemon };
