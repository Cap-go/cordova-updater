import Foundation
#if SWIFT_PACKAGE
import Cordova
#endif

class CordovaPluginCall {
    private let command: CDVInvokedUrlCommand
    private unowned var plugin: CDVPlugin
    private var finished = false

    var callbackId: String {
        command.callbackId
    }

    init(command: CDVInvokedUrlCommand, plugin: CDVPlugin) {
        self.command = command
        self.plugin = plugin
    }

    private func firstDictionary() -> [String: Any]? {
        guard let argument = command.argument(at: 0) else {
            return nil
        }
        return argument as? [String: Any]
    }

    func getString(_ key: String) -> String? {
        getString(key, defaultValue: nil)
    }

    func getString(_ key: String, defaultValue: String?) -> String? {
        guard let dictionary = firstDictionary(),
              let value = dictionary[key],
              !(value is NSNull) else {
            return defaultValue
        }
        if let stringValue = value as? String {
            return stringValue
        }
        return String(describing: value)
    }

    func getBool(_ key: String) -> Bool? {
        guard let dictionary = firstDictionary(),
              let value = dictionary[key],
              !(value is NSNull) else {
            return nil
        }
        if let boolValue = value as? Bool {
            return boolValue
        }
        if let numberValue = value as? NSNumber {
            return numberValue.boolValue
        }
        if let stringValue = value as? String {
            return (stringValue as NSString).boolValue
        }
        return nil
    }

    func getBool(_ key: String, defaultValue: Bool) -> Bool {
        getBool(key) ?? defaultValue
    }


    func getString(_ key: String, _ defaultValue: String) -> String {
        getString(key, defaultValue: defaultValue) ?? defaultValue
    }

    func getBool(_ key: String, _ defaultValue: Bool) -> Bool {
        getBool(key, defaultValue: defaultValue)
    }

    func getValue(_ key: String) -> Any? {
        firstDictionary()?[key]
    }

    func getArray(_ key: String) -> [Any]? {
        guard let dictionary = firstDictionary(),
              let value = dictionary[key],
              !(value is NSNull) else {
            return nil
        }
        return value as? [Any]
    }

    func getObject(_ key: String) -> JSObject? {
        guard let dictionary = firstDictionary(),
              let value = dictionary[key],
              !(value is NSNull) else {
            return nil
        }
        return value as? JSObject
    }

    func resolve() {
        sendResult(status: CDVCommandStatus_OK, message: nil as String?)
    }

    func resolve(_ data: JSObject) {
        sendResult(status: CDVCommandStatus_OK, message: data as [AnyHashable: Any])
    }

    func resolve(_ data: String) {
        sendResult(status: CDVCommandStatus_OK, message: data)
    }

    func reject(_ message: String) {
        reject(message, nil, error: nil, data: nil)
    }

    func reject(_ message: String, _ code: String?) {
        reject(message, code, error: nil, data: nil)
    }

    func reject(_ message: String, _ code: String?, error: Error?) {
        reject(message, code, error: error, data: nil)
    }

    func reject(_ message: String, _ code: String?, error: Error?, data: PluginCallResultData?) {
        var composed = message
        if let code, !code.isEmpty {
            composed = "[\(code)] \(composed)"
        }
        if let error {
            composed += ": \(error.localizedDescription)"
        }
        if let data, !data.isEmpty {
            var payload = data
            payload["message"] = composed
            if let code, !code.isEmpty {
                payload["code"] = code
            }
            sendResult(status: CDVCommandStatus_ERROR, message: payload as [AnyHashable: Any])
            return
        }
        sendResult(status: CDVCommandStatus_ERROR, message: composed)
    }

    private func sendOnMainThread(_ send: () -> Void) {
        if Thread.isMainThread {
            send()
        } else {
            DispatchQueue.main.sync {
                send()
            }
        }
    }

    private func sendResult(status: CDVCommandStatus, message: Any?) {
        guard !finished else {
            return
        }
        finished = true
        let result: CDVPluginResult
        switch message {
        case let dictionary as [AnyHashable: Any]:
            #if SWIFT_PACKAGE
            result = CDVPluginResult(status: status, messageAs: dictionary)!
            #else
            result = CDVPluginResult(status: status, messageAs: dictionary)
            #endif
        case let string as String:
            #if SWIFT_PACKAGE
            result = CDVPluginResult(status: status, messageAs: string)!
            #else
            result = CDVPluginResult(status: status, messageAs: string)
            #endif
        case .none:
            #if SWIFT_PACKAGE
            result = CDVPluginResult(status: status)!
            #else
            result = CDVPluginResult(status: status)
            #endif
        default:
            #if SWIFT_PACKAGE
            result = CDVPluginResult(status: status, messageAs: String(describing: message))!
            #else
            result = CDVPluginResult(status: status, messageAs: String(describing: message))
            #endif
        }

        let callbackId = self.callbackId
        sendOnMainThread {
            self.plugin.commandDelegate.send(result, callbackId: callbackId)
        }
    }

    func sendKeepAliveResult(_ data: JSObject) {
        #if SWIFT_PACKAGE
        let result: CDVPluginResult? = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: data as [AnyHashable: Any])!
        #else
        // Typed optional so this compiles on cordova-ios 7 (implicitly unwrapped)
        // and cordova-ios 8 (nullable) without a force unwrap in the #else branch.
        let result: CDVPluginResult? = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: data as [AnyHashable: Any])
        #endif
        result?.setKeepCallbackAs(true)
        let callbackId = self.callbackId
        sendOnMainThread {
            if let result {
                self.plugin.commandDelegate.send(result, callbackId: callbackId)
            }
        }
    }

    func sendNoResultKeepAlive() {
        #if SWIFT_PACKAGE
        let result: CDVPluginResult? = CDVPluginResult(status: CDVCommandStatus_NO_RESULT)!
        #else
        let result: CDVPluginResult? = CDVPluginResult(status: CDVCommandStatus_NO_RESULT)
        #endif
        result?.setKeepCallbackAs(true)
        let callbackId = self.callbackId
        sendOnMainThread {
            if let result {
                self.plugin.commandDelegate.send(result, callbackId: callbackId)
            }
        }
    }
}
