import JavaScriptCore
import WebKit
import XCTest
@testable import CordovaUpdaterPlugin

final class ReadyGuardTests: XCTestCase {
    func testReadyGenerationBootstrapScriptGetterReturnsGeneration() {
        let context = JSContext()!
        context.exceptionHandler = { _, exception in
            XCTFail(exception?.toString() ?? "JavaScript evaluation failed")
        }
        context.evaluateScript("var window = {};")
        context.evaluateScript(CordovaUpdaterPlugin.readyGenerationBootstrapScript(7))
        XCTAssertEqual(context.evaluateScript("window.__CAPGO_READY_GEN")?.toInt32(), 7)
        context.evaluateScript("window.__capgoReadyGenSlot.value = 12;")
        XCTAssertEqual(context.evaluateScript("window.__CAPGO_READY_GEN")?.toInt32(), 12)
    }

    func testWebViewStatsReporterReinstallsAfterDocumentStartScriptsCleared() {
        let updater = CapgoUpdater()
        let reporter = WebViewStatsReporter(implementation: updater)
        let configuration = WKWebViewConfiguration()
        let webView = WKWebView(frame: .zero, configuration: configuration)

        reporter.install(on: webView)
        XCTAssertEqual(configuration.userContentController.userScripts.count, 1)
        XCTAssertTrue(configuration.userContentController.userScripts[0].source.contains("__capgoWebViewErrorReporterInstalled"))

        configuration.userContentController.removeAllUserScripts()
        XCTAssertEqual(configuration.userContentController.userScripts.count, 0)

        reporter.reinstallDocumentStartScript(on: webView)
        XCTAssertEqual(configuration.userContentController.userScripts.count, 1)
        XCTAssertTrue(configuration.userContentController.userScripts[0].source.contains("__capgoWebViewErrorReporterInstalled"))
    }
}
