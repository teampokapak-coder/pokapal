import UIKit
import Capacitor
import WebKit

/// Subclass so Safari (Develop → Simulator → …) can attach to the Capacitor WKWebView on iOS 16.4+.
final class AppBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        #if DEBUG
        if #available(iOS 16.4, *) {
            webView?.isInspectable = true
        }
        #endif
    }
}
