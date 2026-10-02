package app.capgo.cordova.updater;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(manifest = Config.NONE)
public class BackgroundDownloadSettlementTest {

    @Test
    public void acceptsMatchingSettlementToken() {
        assertTrue(CordovaUpdaterPlugin.shouldAcceptBackgroundDownloadSettlement(3L, 3L));
    }

    @Test
    public void rejectsStaleSettlementToken() {
        assertFalse(CordovaUpdaterPlugin.shouldAcceptBackgroundDownloadSettlement(2L, 3L));
    }

    @Test
    public void rejectsUnsetSettlementToken() {
        assertFalse(CordovaUpdaterPlugin.shouldAcceptBackgroundDownloadSettlement(0L, 3L));
    }
}
