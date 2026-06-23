/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import UIKit

/// Cordova shake menu stub. Full preview/channel shake UI is planned for a follow-up release.
final class ShakeMenu {
    private let logger: Logger

    init(plugin: CordovaUpdaterPlugin, viewController: UIViewController?, logger: Logger, gesture: String) {
        self.logger = logger
        logger.debug("ShakeMenu: gesture \(gesture) registered (Cordova stub)")
    }

    func usesGesture(_ gesture: String) -> Bool {
        false
    }

    func stop() {
        // no-op
    }
}

extension CordovaUpdaterPlugin {
    func syncShakeMenuGestureRecognizer() {
        // Cordova stub: gesture UI not implemented yet
    }

    func removeShakeMenuGestureRecognizer() {
        // no-op
    }
}

extension UIApplication {
    class func topViewController(_ base: UIViewController? = UIApplication.shared.connectedScenes
        .compactMap { ($0 as? UIWindowScene)?.keyWindow }
        .first?.rootViewController) -> UIViewController? {
        if let nav = base as? UINavigationController {
            return topViewController(nav.visibleViewController)
        }
        if let tab = base as? UITabBarController, let selected = tab.selectedViewController {
            return topViewController(selected)
        }
        if let presented = base?.presentedViewController {
            return topViewController(presented)
        }
        return base
    }
}
