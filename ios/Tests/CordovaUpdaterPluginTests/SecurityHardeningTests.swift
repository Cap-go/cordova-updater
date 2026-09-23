import XCTest
@testable import CordovaUpdaterPlugin

final class SecurityHardeningTests: XCTestCase {
    func testResolvePathInsideDirectoryRejectsAbsolutePaths() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let base = root.appendingPathComponent("bundle")
        try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "/etc/passwd")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .absolutePath)
        }
    }

    func testResolvePathInsideDirectoryRejectsBackslashes() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let base = root.appendingPathComponent("bundle")
        try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "assets\\app.js")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .windowsPath)
        }
    }

    func testResolvePathInsideDirectoryRejectsNullBytes() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let base = root.appendingPathComponent("bundle")
        try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: "assets\0app.js")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .windowsPath)
        }
    }

    func testResolvePathInsideDirectoryRejectsDotDotSegments() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let base = root.appendingPathComponent("bundle")
        try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }

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

    func testResolvePathInsideDirectoryRejectsDotAsBaseDirectory() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let base = root.appendingPathComponent("bundle")
        try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolvePathInsideDirectory(baseDirectory: base, relativePath: ".")
        ) { error in
            XCTAssertEqual(error as? CapgoUpdater.SecurePathError, .pathTraversal)
        }
    }

    func testRememberManifestTargetRejectsDuplicateCanonicalPaths() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let base = root.appendingPathComponent("bundle")
        try FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }

        let plain = try CapgoUpdater.resolveManifestTargetPath(baseDirectory: base, fileName: "assets/app.js")
        let brotli = try CapgoUpdater.resolveManifestTargetPath(baseDirectory: base, fileName: "assets/app.js.br")
        var seen = Set<String>()

        XCTAssertTrue(CapgoUpdater.rememberManifestTarget(&seen, targetFile: plain))
        XCTAssertFalse(CapgoUpdater.rememberManifestTarget(&seen, targetFile: brotli))
    }

    func testResolveBundleDirectoryRejectsAbsolutePath() throws {
        let libraryDir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: libraryDir, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: libraryDir) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolveBundleDirectory(libraryDir: libraryDir, bundleId: "/tmp/evil")
        )
    }

    func testResolveBundleDirectoryRejectsPathTraversal() throws {
        let libraryDir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: libraryDir, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: libraryDir) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolveBundleDirectory(libraryDir: libraryDir, bundleId: "../outside-target")
        )
    }

    func testResolveBundleDirectoryRejectsDotAsBundleRoot() throws {
        let libraryDir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: libraryDir, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: libraryDir) }

        XCTAssertThrowsError(
            try CapgoUpdater.resolveBundleDirectory(libraryDir: libraryDir, bundleId: ".")
        )
    }

    func testDeleteRejectsDotBundleId() {
        let updater = CapgoUpdater()
        updater.setLogger(Logger(withTag: "SecurityHardeningTests", options: Logger.Options(level: .silent)))

        XCTAssertFalse(updater.delete(id: ".", removeInfo: true))
        updater.shutdown()
    }
}
