import XCTest
@testable import CordovaUpdaterPlugin

final class SecurityHardeningTests: XCTestCase {
    private func makeBaseDirectory() throws -> URL {
        let base = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        return base
    }

    func testResolvePathInsideDirectoryRejectsAbsolutePaths() throws {
        let base = try makeBaseDirectory()
        defer { try? FileManager.default.removeItem(at: base) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "/etc/passwd")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .absolutePath)
        }
    }

    func testResolvePathInsideDirectoryRejectsBackslashes() throws {
        let base = try makeBaseDirectory()
        defer { try? FileManager.default.removeItem(at: base) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "assets\\app.js")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .windowsPath)
        }
    }

    func testResolvePathInsideDirectoryRejectsNullBytes() throws {
        let base = try makeBaseDirectory()
        defer { try? FileManager.default.removeItem(at: base) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "assets\0app.js")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .windowsPath)
        }
    }

    func testResolvePathInsideDirectoryRejectsDotDotSegments() throws {
        let base = try makeBaseDirectory()
        defer { try? FileManager.default.removeItem(at: base) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "assets/../../secret.js")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .pathTraversal)
        }
        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "../secret.js")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .pathTraversal)
        }
    }

    func testResolvePathInsideDirectoryRejectsDotAsRelativePath() throws {
        let base = try makeBaseDirectory()
        defer { try? FileManager.default.removeItem(at: base) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: ".")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .pathTraversal)
        }
    }

    func testResolvePathInsideDirectoryAllowsNestedRelativePath() throws {
        let base = try makeBaseDirectory()
        defer { try? FileManager.default.removeItem(at: base) }

        let resolved = try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "assets/app.js")
        let expected = base.resolvingSymlinksInPath().appendingPathComponent("assets/app.js").standardizedFileURL.path
        XCTAssertEqual(resolved.standardizedFileURL.path, expected)
    }

    func testResolvePathInsideDirectoryAcceptsNonexistentChild() throws {
        let base = try makeBaseDirectory()
        defer { try? FileManager.default.removeItem(at: base) }

        XCTAssertNoThrow(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "new/file.js")
        )
    }

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

    func testResolveBundleDirectoryRejectsPathTraversal() throws {
        let library = try makeBaseDirectory()
        defer { try? FileManager.default.removeItem(at: library) }

        XCTAssertThrowsError(try CapgoUpdater.resolveBundleDirectory(libraryDir: library, bundleId: "../outside-target")) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .pathTraversal)
        }
    }

    func testResolveBundleDirectoryRejectsDotAsBundleRoot() throws {
        let library = try makeBaseDirectory()
        defer { try? FileManager.default.removeItem(at: library) }

        XCTAssertThrowsError(try CapgoUpdater.resolveBundleDirectory(libraryDir: library, bundleId: ".")) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .pathTraversal)
        }
    }
}
