import * as chai from 'chai';
import { QubicTickData } from '../src/qubic-types/QubicTickData';
import { QubicDefinitions } from '../src/QubicDefinitions';

const expect = chai.expect;

/**
 * Test suite to validate the parsing of TickData packages.
 */
describe('Parse a TickData Package', () => {

  /**
   * Every field must be extracted with its full length. This guards against the
   * slice(offset, LENGTH) vs slice(offset, offset + LENGTH) mistake, which used
   * to return an empty timeLock and signature and a truncated unionData.
   */
  it('should extract every field with its full length', () => {
    const size = 41328;
    const data = new Uint8Array(size);
    const view = new DataView(data.buffer);

    // header
    view.setUint16(0, 0x1234, true); // computorIndex
    view.setUint16(2, 9, true);      // epoch
    view.setUint32(4, 123456, true); // tick

    // absolute field offsets
    const unionOffset = 16;
    const timeLockOffset = unionOffset + 256;
    const signatureOffset =
      timeLockOffset +
      32 +
      QubicDefinitions.NUMBER_OF_TRANSACTIONS_PER_TICK * QubicDefinitions.DIGEST_LENGTH +
      QubicDefinitions.MAX_NUMBER_OF_CONTRACTS * 8;

    // distinctive bytes for the fields that used to be truncated or emptied
    for (let i = 0; i < 256; i++) data[unionOffset + i] = (i + 1) & 0xff;
    for (let i = 0; i < 32; i++) data[timeLockOffset + i] = (i + 100) & 0xff;
    for (let i = 0; i < QubicDefinitions.SIGNATURE_LENGTH; i++) {
      data[signatureOffset + i] = (i + 7) & 0xff;
    }

    const tick = new QubicTickData().parse(data);
    expect(tick).to.not.be.undefined;

    expect(tick!.getComputorIndex()).to.equal(0x1234);

    expect(tick!.getUnionData()).to.have.lengthOf(256);
    expect(tick!.getUnionData()[200]).to.equal((200 + 1) & 0xff);

    expect(tick!.getTimeLock()).to.have.lengthOf(32);
    expect(Array.from(tick!.getTimeLock())).to.deep.equal(
      Array.from({ length: 32 }, (_, i) => (i + 100) & 0xff)
    );

    const signatureBytes = tick!.getSignature().getPackageData();
    expect(signatureBytes).to.have.lengthOf(QubicDefinitions.SIGNATURE_LENGTH);
    expect(Array.from(signatureBytes)).to.deep.equal(
      Array.from({ length: QubicDefinitions.SIGNATURE_LENGTH }, (_, i) => (i + 7) & 0xff)
    );
  });

});
