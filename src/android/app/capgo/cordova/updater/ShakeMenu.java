/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
package app.capgo.cordova.updater;

import android.app.Activity;

/**
 * Cordova shake menu stub. Full preview/channel shake UI is planned for a follow-up release.
 */
public class ShakeMenu implements ShakeDetector.Listener, ThreeFingerPinchDetector.Listener {

    private final Logger logger;

    public ShakeMenu(CordovaUpdaterPlugin plugin, Activity activity, Logger logger, String gesture) {
        this.logger = logger;
        logger.debug("ShakeMenu: gesture " + gesture + " registered (Cordova stub)");
    }

    public boolean usesGesture(String gesture) {
        return false;
    }

    public void stop() {
        // no-op
    }

    @Override
    public void onShakeDetected() {
        logger.debug("ShakeMenu: shake detected (Cordova stub)");
    }

    @Override
    public void onThreeFingerPinchDetected() {
        logger.debug("ShakeMenu: three-finger pinch detected (Cordova stub)");
    }
}
