chrome.commands.onCommand.addListener(
  async (command: string): Promise<void> => {
    if (command !== "show-qr") return;

    // Open the default popup using browser action
    await chrome.action.openPopup();
  },
);
