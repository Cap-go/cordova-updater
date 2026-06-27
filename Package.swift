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
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/Alamofire/Alamofire.git", .upToNextMajor(from: "5.12.0")),
        .package(url: "https://github.com/weichsel/ZIPFoundation.git", from: "0.9.20"),
        .package(url: "https://github.com/mrackwitz/Version.git", exact: "0.8.0"),
        .package(url: "https://github.com/attaswift/BigInt.git", from: "5.7.0")
    ],
    targets: [
        .target(
            name: "CordovaUpdaterPlugin",
            dependencies: [
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "ZIPFoundation", package: "ZIPFoundation"),
                .product(name: "Alamofire", package: "Alamofire"),
                .product(name: "Version", package: "Version"),
                .product(name: "BigInt", package: "BigInt")
            ],
            path: "src/ios",
            exclude: ["Info.plist"]),
        .testTarget(
            name: "CordovaUpdaterPluginTests",
            dependencies: [
                "CordovaUpdaterPlugin",
                .product(name: "Version", package: "Version")
            ],
            path: "ios/Tests/CordovaUpdaterPluginTests")
    ],
    swiftLanguageVersions: [.v5]
)
