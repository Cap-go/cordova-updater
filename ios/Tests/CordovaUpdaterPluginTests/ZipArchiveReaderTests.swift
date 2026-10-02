import XCTest
@testable import CordovaUpdaterPlugin

final class ZipArchiveReaderTests: XCTestCase {
    func testDataRangeFitsWithinRejectsUInt64Overflow() {
        let bound: UInt64 = 1_000
        let offset = UInt64.max
        let length: UInt64 = 1
        XCTAssertFalse(ZipArchiveReader.dataRangeFitsWithin(offset: offset, length: length, upperBound: bound))
    }

    func testDataRangeFitsWithinAcceptsValidRange() {
        XCTAssertTrue(ZipArchiveReader.dataRangeFitsWithin(offset: 10, length: 5, upperBound: 20))
        XCTAssertFalse(ZipArchiveReader.dataRangeFitsWithin(offset: 10, length: 11, upperBound: 20))
        XCTAssertFalse(ZipArchiveReader.dataRangeFitsWithin(offset: 21, length: 1, upperBound: 20))
    }
}
