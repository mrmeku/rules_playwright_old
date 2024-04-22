import { format } from "util";
import { browsers } from "./browsers.json";

const PLAYWRIGHT_CDN_MIRRORS = [
  "https://playwright.azureedge.net",
  "https://playwright-akamai.azureedge.net",
  "https://playwright-verizon.azureedge.net",
];

enum OS {
  LINUX = "linux",
  MAC = "mac",
  WIN = "win",
}

const EXECUTABLE_PATHS: Record<PlaywrightBrowserGroup, Record<OS, string[]>> = {
  chromium: {
    linux: ["chrome-linux", "chrome"],
    mac: ["chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"],
    win: ["chrome-win", "chrome.exe"],
  },
  firefox: {
    linux: ["firefox", "firefox"],
    mac: ["firefox", "Nightly.app", "Contents", "MacOS", "firefox"],
    win: ["firefox", "firefox.exe"],
  },
  webkit: {
    linux: ["pw_run.sh"],
    mac: ["pw_run.sh"],
    win: ["Playwright.exe"],
  },
  ffmpeg: {
    linux: ["ffmpeg-linux"],
    mac: ["ffmpeg-mac"],
    win: ["ffmpeg-win64.exe"],
  },
};

const DOWNLOAD_PATHS: Record<
  PlaywrightBrowser,
  Record<PlaywrightPlatform | "<unknown>", string | undefined>
> = {
  chromium: {
    "<unknown>": undefined,
    "ubuntu18.04-x64": undefined,
    "ubuntu20.04-x64": "builds/chromium/%s/chromium-linux.zip",
    "ubuntu22.04-x64": "builds/chromium/%s/chromium-linux.zip",
    "ubuntu18.04-arm64": undefined,
    "ubuntu20.04-arm64": "builds/chromium/%s/chromium-linux-arm64.zip",
    "ubuntu22.04-arm64": "builds/chromium/%s/chromium-linux-arm64.zip",
    "debian11-x64": "builds/chromium/%s/chromium-linux.zip",
    "debian11-arm64": "builds/chromium/%s/chromium-linux-arm64.zip",
    "debian12-x64": "builds/chromium/%s/chromium-linux.zip",
    "debian12-arm64": "builds/chromium/%s/chromium-linux-arm64.zip",
    "mac10.13": "builds/chromium/%s/chromium-mac.zip",
    "mac10.14": "builds/chromium/%s/chromium-mac.zip",
    "mac10.15": "builds/chromium/%s/chromium-mac.zip",
    mac11: "builds/chromium/%s/chromium-mac.zip",
    "mac11-arm64": "builds/chromium/%s/chromium-mac-arm64.zip",
    mac12: "builds/chromium/%s/chromium-mac.zip",
    "mac12-arm64": "builds/chromium/%s/chromium-mac-arm64.zip",
    mac13: "builds/chromium/%s/chromium-mac.zip",
    "mac13-arm64": "builds/chromium/%s/chromium-mac-arm64.zip",
    mac14: "builds/chromium/%s/chromium-mac.zip",
    "mac14-arm64": "builds/chromium/%s/chromium-mac-arm64.zip",
    win64: "builds/chromium/%s/chromium-win64.zip",
  },
  "chromium-tip-of-tree": {
    "<unknown>": undefined,
    "ubuntu18.04-x64": undefined,
    "ubuntu20.04-x64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-linux.zip",
    "ubuntu22.04-x64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-linux.zip",
    "ubuntu18.04-arm64": undefined,
    "ubuntu20.04-arm64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-linux-arm64.zip",
    "ubuntu22.04-arm64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-linux-arm64.zip",
    "debian11-x64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-linux.zip",
    "debian11-arm64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-linux-arm64.zip",
    "debian12-x64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-linux.zip",
    "debian12-arm64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-linux-arm64.zip",
    "mac10.13": "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac.zip",
    "mac10.14": "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac.zip",
    "mac10.15": "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac.zip",
    mac11: "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac.zip",
    "mac11-arm64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac-arm64.zip",
    mac12: "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac.zip",
    "mac12-arm64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac-arm64.zip",
    mac13: "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac.zip",
    "mac13-arm64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac-arm64.zip",
    mac14: "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac.zip",
    "mac14-arm64":
      "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-mac-arm64.zip",
    win64: "builds/chromium-tip-of-tree/%s/chromium-tip-of-tree-win64.zip",
  },
  firefox: {
    "<unknown>": undefined,
    "ubuntu18.04-x64": undefined,
    "ubuntu20.04-x64": "builds/firefox/%s/firefox-ubuntu-20.04.zip",
    "ubuntu22.04-x64": "builds/firefox/%s/firefox-ubuntu-22.04.zip",
    "ubuntu18.04-arm64": undefined,
    "ubuntu20.04-arm64": "builds/firefox/%s/firefox-ubuntu-20.04-arm64.zip",
    "ubuntu22.04-arm64": "builds/firefox/%s/firefox-ubuntu-22.04-arm64.zip",
    "debian11-x64": "builds/firefox/%s/firefox-debian-11.zip",
    "debian11-arm64": "builds/firefox/%s/firefox-debian-11-arm64.zip",
    "debian12-x64": "builds/firefox/%s/firefox-debian-12.zip",
    "debian12-arm64": "builds/firefox/%s/firefox-debian-12-arm64.zip",
    "mac10.13": "builds/firefox/%s/firefox-mac-13.zip",
    "mac10.14": "builds/firefox/%s/firefox-mac-13.zip",
    "mac10.15": "builds/firefox/%s/firefox-mac-13.zip",
    mac11: "builds/firefox/%s/firefox-mac-13.zip",
    "mac11-arm64": "builds/firefox/%s/firefox-mac-13-arm64.zip",
    mac12: "builds/firefox/%s/firefox-mac-13.zip",
    "mac12-arm64": "builds/firefox/%s/firefox-mac-13-arm64.zip",
    mac13: "builds/firefox/%s/firefox-mac-13.zip",
    "mac13-arm64": "builds/firefox/%s/firefox-mac-13-arm64.zip",
    mac14: "builds/firefox/%s/firefox-mac-13.zip",
    "mac14-arm64": "builds/firefox/%s/firefox-mac-13-arm64.zip",
    win64: "builds/firefox/%s/firefox-win64.zip",
  },
  "firefox-beta": {
    "<unknown>": undefined,
    "ubuntu18.04-x64": undefined,
    "ubuntu20.04-x64": "builds/firefox-beta/%s/firefox-beta-ubuntu-20.04.zip",
    "ubuntu22.04-x64": "builds/firefox-beta/%s/firefox-beta-ubuntu-22.04.zip",
    "ubuntu18.04-arm64": undefined,
    "ubuntu20.04-arm64": undefined,
    "ubuntu22.04-arm64":
      "builds/firefox-beta/%s/firefox-beta-ubuntu-22.04-arm64.zip",
    "debian11-x64": "builds/firefox-beta/%s/firefox-beta-debian-11.zip",
    "debian11-arm64": "builds/firefox-beta/%s/firefox-beta-debian-11-arm64.zip",
    "debian12-x64": "builds/firefox-beta/%s/firefox-beta-debian-12.zip",
    "debian12-arm64": "builds/firefox-beta/%s/firefox-beta-debian-12-arm64.zip",
    "mac10.13": "builds/firefox-beta/%s/firefox-beta-mac-13.zip",
    "mac10.14": "builds/firefox-beta/%s/firefox-beta-mac-13.zip",
    "mac10.15": "builds/firefox-beta/%s/firefox-beta-mac-13.zip",
    mac11: "builds/firefox-beta/%s/firefox-beta-mac-13.zip",
    "mac11-arm64": "builds/firefox-beta/%s/firefox-beta-mac-13-arm64.zip",
    mac12: "builds/firefox-beta/%s/firefox-beta-mac-13.zip",
    "mac12-arm64": "builds/firefox-beta/%s/firefox-beta-mac-13-arm64.zip",
    mac13: "builds/firefox-beta/%s/firefox-beta-mac-13.zip",
    "mac13-arm64": "builds/firefox-beta/%s/firefox-beta-mac-13-arm64.zip",
    mac14: "builds/firefox-beta/%s/firefox-beta-mac-13.zip",
    "mac14-arm64": "builds/firefox-beta/%s/firefox-beta-mac-13-arm64.zip",
    win64: "builds/firefox-beta/%s/firefox-beta-win64.zip",
  },
  webkit: {
    "<unknown>": undefined,
    "ubuntu18.04-x64": undefined,
    "ubuntu20.04-x64": "builds/webkit/%s/webkit-ubuntu-20.04.zip",
    "ubuntu22.04-x64": "builds/webkit/%s/webkit-ubuntu-22.04.zip",
    "ubuntu18.04-arm64": undefined,
    "ubuntu20.04-arm64": "builds/webkit/%s/webkit-ubuntu-20.04-arm64.zip",
    "ubuntu22.04-arm64": "builds/webkit/%s/webkit-ubuntu-22.04-arm64.zip",
    "debian11-x64": "builds/webkit/%s/webkit-debian-11.zip",
    "debian11-arm64": "builds/webkit/%s/webkit-debian-11-arm64.zip",
    "debian12-x64": "builds/webkit/%s/webkit-debian-12.zip",
    "debian12-arm64": "builds/webkit/%s/webkit-debian-12-arm64.zip",
    "mac10.13": undefined,
    "mac10.14":
      "builds/deprecated-webkit-mac-10.14/%s/deprecated-webkit-mac-10.14.zip",
    "mac10.15":
      "builds/deprecated-webkit-mac-10.15/%s/deprecated-webkit-mac-10.15.zip",
    mac11: "builds/webkit/%s/webkit-mac-11.zip",
    "mac11-arm64": "builds/webkit/%s/webkit-mac-11-arm64.zip",
    mac12: "builds/webkit/%s/webkit-mac-12.zip",
    "mac12-arm64": "builds/webkit/%s/webkit-mac-12-arm64.zip",
    mac13: "builds/webkit/%s/webkit-mac-13.zip",
    "mac13-arm64": "builds/webkit/%s/webkit-mac-13-arm64.zip",
    mac14: "builds/webkit/%s/webkit-mac-14.zip",
    "mac14-arm64": "builds/webkit/%s/webkit-mac-14-arm64.zip",
    win64: "builds/webkit/%s/webkit-win64.zip",
  },
  ffmpeg: {
    "<unknown>": undefined,
    "ubuntu18.04-x64": undefined,
    "ubuntu20.04-x64": "builds/ffmpeg/%s/ffmpeg-linux.zip",
    "ubuntu22.04-x64": "builds/ffmpeg/%s/ffmpeg-linux.zip",
    "ubuntu18.04-arm64": undefined,
    "ubuntu20.04-arm64": "builds/ffmpeg/%s/ffmpeg-linux-arm64.zip",
    "ubuntu22.04-arm64": "builds/ffmpeg/%s/ffmpeg-linux-arm64.zip",
    "debian11-x64": "builds/ffmpeg/%s/ffmpeg-linux.zip",
    "debian11-arm64": "builds/ffmpeg/%s/ffmpeg-linux-arm64.zip",
    "debian12-x64": "builds/ffmpeg/%s/ffmpeg-linux.zip",
    "debian12-arm64": "builds/ffmpeg/%s/ffmpeg-linux-arm64.zip",
    "mac10.13": "builds/ffmpeg/%s/ffmpeg-mac.zip",
    "mac10.14": "builds/ffmpeg/%s/ffmpeg-mac.zip",
    "mac10.15": "builds/ffmpeg/%s/ffmpeg-mac.zip",
    mac11: "builds/ffmpeg/%s/ffmpeg-mac.zip",
    "mac11-arm64": "builds/ffmpeg/%s/ffmpeg-mac-arm64.zip",
    mac12: "builds/ffmpeg/%s/ffmpeg-mac.zip",
    "mac12-arm64": "builds/ffmpeg/%s/ffmpeg-mac-arm64.zip",
    mac13: "builds/ffmpeg/%s/ffmpeg-mac.zip",
    "mac13-arm64": "builds/ffmpeg/%s/ffmpeg-mac-arm64.zip",
    mac14: "builds/ffmpeg/%s/ffmpeg-mac.zip",
    "mac14-arm64": "builds/ffmpeg/%s/ffmpeg-mac-arm64.zip",
    win64: "builds/ffmpeg/%s/ffmpeg-win64.zip",
  },
};

enum PlaywrightBrowser {
  CHROMIUM = "chromium",
  FIREFOX = "firefox",
  WEBKIT = "webkit",
  FFMPEG = "ffmpeg",
  FIREFOX_BETA = "firefox-beta",
  CHROMIUM_TIP_OF_TREE = "chromium-tip-of-tree",
}

enum PlaywrightBrowserGroup {
  CHROMIUM = "chromium",
  FIREFOX = "firefox",
  WEBKIT = "webkit",
  FFMPEG = "ffmpeg",
}

const browserToGroup: Record<PlaywrightBrowser, PlaywrightBrowserGroup> = {
  [PlaywrightBrowser.CHROMIUM]: PlaywrightBrowserGroup.CHROMIUM,
  [PlaywrightBrowser.FIREFOX]: PlaywrightBrowserGroup.FIREFOX,
  [PlaywrightBrowser.WEBKIT]: PlaywrightBrowserGroup.WEBKIT,
  [PlaywrightBrowser.FFMPEG]: PlaywrightBrowserGroup.FFMPEG,
  [PlaywrightBrowser.FIREFOX_BETA]: PlaywrightBrowserGroup.FIREFOX,
  [PlaywrightBrowser.CHROMIUM_TIP_OF_TREE]: PlaywrightBrowserGroup.CHROMIUM,
};

enum PlaywrightPlatform {
  UBUNTU18_04_X64 = "ubuntu18.04-x64",
  UBUNTU20_04_X64 = "ubuntu20.04-x64",
  UBUNTU22_04_X64 = "ubuntu22.04-x64",
  UBUNTU18_04_ARM64 = "ubuntu18.04-arm64",
  UBUNTU20_04_ARM64 = "ubuntu20.04-arm64",
  UBUNTU22_04_ARM64 = "ubuntu22.04-arm64",
  DEBIAN11_X64 = "debian11-x64",
  DEBIAN11_ARM64 = "debian11-arm64",
  DEBIAN12_X64 = "debian12-x64",
  DEBIAN12_ARM64 = "debian12-arm64",
  MAC10_13 = "mac10.13",
  MAC10_14 = "mac10.14",
  MAC10_15 = "mac10.15",
  MAC11 = "mac11",
  MAC11_ARM64 = "mac11-arm64",
  MAC12 = "mac12",
  MAC12_ARM64 = "mac12-arm64",
  MAC13 = "mac13",
  MAC13_ARM64 = "mac13-arm64",
  MAC14 = "mac14",
  MAC14_ARM64 = "mac14-arm64",
  WIN64 = "win64",
}

const platformToOs: Record<PlaywrightPlatform, OS> = {
  [PlaywrightPlatform.UBUNTU18_04_X64]: OS.LINUX,
  [PlaywrightPlatform.UBUNTU20_04_X64]: OS.LINUX,
  [PlaywrightPlatform.UBUNTU22_04_X64]: OS.LINUX,
  [PlaywrightPlatform.UBUNTU18_04_ARM64]: OS.LINUX,
  [PlaywrightPlatform.UBUNTU20_04_ARM64]: OS.LINUX,
  [PlaywrightPlatform.UBUNTU22_04_ARM64]: OS.LINUX,
  [PlaywrightPlatform.DEBIAN11_X64]: OS.LINUX,
  [PlaywrightPlatform.DEBIAN11_ARM64]: OS.LINUX,
  [PlaywrightPlatform.DEBIAN12_X64]: OS.LINUX,
  [PlaywrightPlatform.DEBIAN12_ARM64]: OS.LINUX,
  [PlaywrightPlatform.MAC10_13]: OS.MAC,
  [PlaywrightPlatform.MAC10_14]: OS.MAC,
  [PlaywrightPlatform.MAC10_15]: OS.MAC,
  [PlaywrightPlatform.MAC11]: OS.MAC,
  [PlaywrightPlatform.MAC11_ARM64]: OS.MAC,
  [PlaywrightPlatform.MAC12]: OS.MAC,
  [PlaywrightPlatform.MAC12_ARM64]: OS.MAC,
  [PlaywrightPlatform.MAC13]: OS.MAC,
  [PlaywrightPlatform.MAC13_ARM64]: OS.MAC,
  [PlaywrightPlatform.MAC14]: OS.MAC,
  [PlaywrightPlatform.MAC14_ARM64]: OS.MAC,
  [PlaywrightPlatform.WIN64]: OS.WIN,
};

const browserSet = new Set(Object.values(PlaywrightBrowser));
const httpArchives = browsers.flatMap((browser) => {
  if (!browserSet.has(browser.name as PlaywrightBrowser)) {
    return [];
  }
  const browserName = browser.name as PlaywrightBrowser;
  const browserGroup = browserToGroup[browserName];
  const paths = DOWNLOAD_PATHS[browserName as PlaywrightBrowser];

  return Object.entries(paths)
    .filter((entry): entry is [PlaywrightPlatform, string] => Boolean(entry[1]))
    .map(([platform, template]) => {
      const downloadPath = format(template, browserName);
      const executablePath =
        EXECUTABLE_PATHS[browserGroup][platformToOs[platform]];
      return {
        name: `${browserName}-${platform}`,
        urls: PLAYWRIGHT_CDN_MIRRORS.map(
          (cdnHost) => `"${cdnHost}/${downloadPath}"`
        ),
        stripPrefix: downloadPath.split("/").pop(),
        buildFileContent: `"""
    filegroup(
        name = "all",
        srcs = glob(["**"]),
        visibility = ["//visibility:public"],
    )

    filegroup(
        name = "bin",
        srcs = ["${executablePath.join("/")}"],
        visibility = ["//visibility:public"],
    )
    """`,
      };
    });
});

const buildFile = httpArchives
  .map(
    ({ name, stripPrefix, urls, buildFileContent }) => `new_http_archive(
    name = "${name}",
    build_file_content = ${buildFileContent},
    urls = [
        ${urls.join(",\n        ")}
    ],
    strip_prefix = "${stripPrefix}",
)`
  )
  .join("\n\n");

console.log(buildFile);
