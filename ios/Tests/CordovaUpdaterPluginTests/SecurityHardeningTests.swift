import XCTest
@testable import CordovaUpdaterPlugin

final class SecurityHardeningTests: XCTestCase {
    func testResolvePathInsideDirectoryRejectsSymlinkEscape() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let base = root.appendingPathComponent("bundle")
        let outside = root.appendingPathComponent("outside")
        try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        try FileManager.default.createDirectory(at: outside, withIntermediateDirectories: true)
        let symlink = base.appendingPathComponent("escape")
        try FileManager.default.createSymbolicLink(at: symlink, withDestinationURL: outside)
        defer { try? FileManager.default.removeItem(at: root) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "escape/secret.txt")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .pathTraversal)
        }
    }
}
