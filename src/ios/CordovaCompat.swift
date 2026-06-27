import Foundation
import WebKit

typealias JSObject = [String: Any]
typealias PluginCallResultData = [String: Any]
typealias CAPPluginCall = CordovaPluginCall

@objc protocol CDVPluginSchemeHandler {
    func overrideSchemeTask(_ task: WKURLSchemeTask) -> Bool
    func stop(_ task: WKURLSchemeTask)
}
