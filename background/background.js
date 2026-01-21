chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "show-qr") return;

  // Open the default popup using browser action
  await chrome.action.openPopup();
});
