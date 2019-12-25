import chromep from "chrome-promise";

import TabChangeInfo = chrome.tabs.TabChangeInfo;

chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: TabChangeInfo) => {
  try {
    if (changeInfo.status === "loading") {
      await chromep.pageAction.show(tabId);
    }
  } catch (err) {
    // Ignore error
  }
});
