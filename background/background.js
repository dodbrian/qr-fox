chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "show-qr") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  const url = tab.url || "";
  const title = tab.title || "";

  const popupURL = chrome.runtime.getURL(
    `popup/popup.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  );

  chrome.windows.create({
    url: popupURL,
    type: "popup",
    width: 450,
    height: 600,
    focused: true,
  });
});
