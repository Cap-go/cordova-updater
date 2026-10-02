import XCTest
@testable import CordovaUpdaterPlugin

final class ReadyGuardTests: XCTestCase {
    func testReadyGenerationBootstrapScriptDefinesGetterForGeneration() {
        let script = CordovaUpdaterPlugin.readyGenerationBootstrapScript(7)
        XCTAssertTrue(script.contains("__CAPGO_READY_GEN"))
        XCTAssertTrue(script.contains("value: 7"))
    }
}
