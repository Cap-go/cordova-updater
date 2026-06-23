import Foundation
import WebKit

public class UpdaterSchemeHandler: NSObject {
    private let activeBundleDirLock = NSLock()
    private var _activeBundleDir: URL?

    private let activeTasksQueue = DispatchQueue(label: "app.capgo.cordova.updater.schemeHandler")
    private var activeTasks = Set<URLSchemeTaskWrapper>()

    public var activeBundleDir: URL? {
        get {
            activeBundleDirLock.lock()
            defer { activeBundleDirLock.unlock() }
            return _activeBundleDir
        }
        set {
            activeBundleDirLock.lock()
            _activeBundleDir = newValue
            activeBundleDirLock.unlock()
        }
    }

    public func handle(task: WKURLSchemeTask) -> Bool {
        guard let baseDir = activeBundleDir, let requestURL = task.request.url else {
            return false
        }
        var relativePath = requestURL.path
        if relativePath.hasPrefix("/") { relativePath = String(relativePath.dropFirst()) }
        if relativePath.isEmpty || relativePath.hasSuffix("/") { relativePath += "index.html" }
        let fileURL = baseDir.appendingPathComponent(relativePath).standardizedFileURL
        let canonicalBase = baseDir.standardizedFileURL.path
        guard fileURL.path == canonicalBase || fileURL.path.hasPrefix(canonicalBase + "/") else { return false }
        var isDirectory: ObjCBool = false
        guard FileManager.default.fileExists(atPath: fileURL.path, isDirectory: &isDirectory), !isDirectory.boolValue else { return false }
        let wrapper = URLSchemeTaskWrapper(task: task)
        activeTasksQueue.sync { _ = activeTasks.insert(wrapper) }
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.serve(task: task, wrapper: wrapper, fileURL: fileURL, requestURL: requestURL)
        }
        return true
    }

    public func stop(task: WKURLSchemeTask) {
        activeTasksQueue.sync { activeTasks = activeTasks.filter { $0.task !== task } }
    }

    private func serve(task: WKURLSchemeTask, wrapper: URLSchemeTaskWrapper, fileURL: URL, requestURL: URL) {
        guard let data = try? Data(contentsOf: fileURL) else {
            if activeTasksQueue.sync(execute: { activeTasks.contains(wrapper) }) { task.didFailWithError(NSError(domain: "CapgoCordovaUpdater", code: 1)) }
            activeTasksQueue.sync { _ = activeTasks.remove(wrapper) }
            return
        }
        let headers = ["Content-Type": mimeType(for: fileURL), "Cache-Control": "no-cache", "Content-Length": String(data.count)]
        guard let response = HTTPURLResponse(url: requestURL, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: headers) else { return }
        if activeTasksQueue.sync(execute: { activeTasks.contains(wrapper) }) {
            task.didReceive(response)
            task.didReceive(data)
            task.didFinish()
        }
        activeTasksQueue.sync { _ = activeTasks.remove(wrapper) }
    }

    private func mimeType(for url: URL) -> String {
        switch url.pathExtension.lowercased() {
        case "js", "mjs": return "application/javascript"
        case "html", "htm": return "text/html"
        case "css": return "text/css"
        case "json": return "application/json"
        case "wasm": return "application/wasm"
        default: return "application/octet-stream"
        }
    }
}

private final class URLSchemeTaskWrapper: Hashable {
    let task: WKURLSchemeTask
    init(task: WKURLSchemeTask) { self.task = task }
    static func == (lhs: URLSchemeTaskWrapper, rhs: URLSchemeTaskWrapper) -> Bool { lhs.task === rhs.task }
    func hash(into hasher: inout Hasher) { hasher.combine(ObjectIdentifier(task as AnyObject)) }
}
