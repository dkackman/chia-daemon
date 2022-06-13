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
            await chia.connect();
            expect(error).to.equal(true);
        });
        it('should succeed on valid connection _DEBUG_', async function() {
            this.timeout(50000);
            const connection = {
                host: 'localhost',
                port: 55400,
                key_path: '~/.chia/mainnet/config/ssl/daemon/private_daemon.key',
                cert_path: '~/.chia/mainnet/config/ssl/daemon/private_daemon.crt',
                timeout_seconds: 30,
            };
            
            let error = false;

            const chia = new ChiaDaemon(connection, 'tests');
            chia.on('error', e => {
                console.log(e);
                error = true;
            });
            await chia.connect(1750);
            expect(error).to.equal(false);
            chia.disconnect();
        });
    });
});
