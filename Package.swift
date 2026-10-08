// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapgoCordovaUpdater",
    platforms: [.iOS("15.0")],
    products: [
        .library(
            name: "CapgoCordovaUpdater",
            targets: ["CordovaUpdaterPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.5.3")
    ],
    targets: [
        .target(
            name: "CordovaUpdaterPlugin",
            dependencies: [
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "src/ios",
            exclude: ["Info.plist"]),
        .testTarget(
            name: "CordovaUpdaterPluginTests",
            dependencies: [
                "CordovaUpdaterPlugin"
            ],
            path: "ios/Tests/CordovaUpdaterPluginTests")
    ],
    swiftLanguageVersions: [.v5]
)
