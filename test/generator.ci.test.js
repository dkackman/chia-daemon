import chai from "chai";
import { makePayload } from '../src/payload_generator.js';

const expect = chai.expect;

describe('payload-generator', () => {
    describe('generator', () => {
        it('should make simple object from request schema', () => {
            const payload = makePayload('crawler', 'open_connection');
            expect(payload).to.not.equal(null);
            expect(payload).to.not.equal(undefined);
            expect(payload.hasOwnProperty('ip')).to.equal(true);
            expect(payload.hasOwnProperty('port')).to.equal(true);
            expect(typeof payload.ip).to.equal('string');
            expect(typeof payload.port).to.equal('number');
        });
        it('should respect default values', () => {
            const payload = makePayload('crawler', 'get_ips_after_timestamp');
            expect(payload).to.not.equal(null);
            expect(payload).to.not.equal(undefined);
            expect(payload.hasOwnProperty('limit')).to.equal(true);
            expect(payload.limit).to.equal(10000);
        });
        it('should return undefined when no payload is required _DEBUG_', () => {
            const payload = makePayload('crawler', 'healthz');
            expect(payload).to.equal(undefined);
        });  
    });
});
