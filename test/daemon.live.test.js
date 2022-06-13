import chai from "chai";
import { ChiaDaemon } from '../src/chia_daemon.js';

const expect = chai.expect;

describe('chia-daemon', () => {
    describe('connection', () => {
        it('should raise error event on invalid connection', async () => {
            const bad_connection = {
                host: 'localhost',
                port: 44444,
                key_path: '~/.chia/mainnet/config/ssl/daemon/private_daemon.key',
                cert_path: '~/.chia/mainnet/config/ssl/daemon/private_daemon.crt',
                timeout_seconds: 30,
            };

            let error = false;

            const chia = new ChiaDaemon(bad_connection, 'tests');
            chia.on('error', e => {
                error = true;
            });
            const connected = await chia.connect();

            expect(error).to.equal(true);
            expect(connected).to.equal(false);
        });
        it('should return true on valid connection _DEBUG_', async function () {
            const connection = {
                host: '172.17.172.74',
                port: 55400,
                key_path: '~/.chia/mainnet - wsl/config/ssl/daemon/private_daemon.key',
                cert_path: '~/.chia/mainnet - wsl/config/ssl/daemon/private_daemon.crt',
                timeout_seconds: 30,
            };

            const chia = new ChiaDaemon(connection, 'tests');
            let error = false;
            chia.on('error', e => {
                console.log(e);
                error = true;
            });
            const connected = await chia.connect();
            chia.disconnect();

            expect(error).to.equal(false);
            expect(connected).to.equal(true);
        });
    });
});
