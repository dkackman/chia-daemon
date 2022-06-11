import chai from "chai";
import createRpcProxy from '../src/rpc_proxy.js';

const expect = chai.expect;

describe('rpc-proxy', () => {
    describe('invocation', () => {
        it('should forward Object function calls to base object', () => {
            const proxy = createRpcProxy(null, '');
            const str = proxy.toString();
            expect(str).to.equal('[object Object]');
        });
        it('should forward all other function calls to sendCommand', async () => {
            let resulting_endpoint = '';
            let resulting_functionName = '';
            
            const fakeChia = {
                sendCommand: (endpoint, functionName, data) => {
                    resulting_endpoint = endpoint;
                    resulting_functionName = functionName;
                }
            };

            const proxy = createRpcProxy(fakeChia, 'TEST_ENDPOINT');
            await proxy.TEST_FUNCTION();
            expect(resulting_endpoint).to.equal('TEST_ENDPOINT');
            expect(resulting_functionName).to.equal('TEST_FUNCTION');
        });
    });
});
