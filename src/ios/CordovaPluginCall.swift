import Foundation
#if SWIFT_PACKAGE
import Cordova
#endif

class CordovaPluginCall {
    private let command: CDVInvokedUrlCommand
    private weak var plugin: CDVPlugin?
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

    private func sendOnMainThread(_ send: @escaping () -> Void) {
        if Thread.isMainThread {
            send()
        } else {
            DispatchQueue.main.async {
                send()
            }
        }
    }

    private func sendResult(status: CDVCommandStatus, message: Any?) {
        guard !finished else {
            return
        }
        finished = true
        guard let plugin else {
            return
        }

        let result: CDVPluginResult
        switch message {
        case let dictionary as [AnyHashable: Any]:
            result = CDVPluginResult(status: status, messageAs: dictionary)!
        case let string as String:
            result = CDVPluginResult(status: status, messageAs: string)!
        case .none:
            result = CDVPluginResult(status: status)!
        default:
            result = CDVPluginResult(status: status, messageAs: String(describing: message))!
        }

        let callbackId = self.callbackId
        sendOnMainThread {
            plugin.commandDelegate.send(result, callbackId: callbackId)
        }
    }

    func sendKeepAliveResult(_ data: JSObject) {
        guard let plugin else {
            return
        }
        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: data as [AnyHashable: Any])!
        result.setKeepCallbackAs(true)
        let callbackId = self.callbackId
        sendOnMainThread {
            plugin.commandDelegate.send(result, callbackId: callbackId)
        }
    }

    func sendNoResultKeepAlive() {
        guard let plugin else {
            return
        }
        let result = CDVPluginResult(status: CDVCommandStatus_NO_RESULT)!
        result.setKeepCallbackAs(true)
        let callbackId = self.callbackId
        sendOnMainThread {
            plugin.commandDelegate.send(result, callbackId: callbackId)
        }
    }
}
