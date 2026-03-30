import type { Mock } from "vitest";

interface ChromeMock {
  i18n: {
    getMessage: Mock<(_messageKey: string) => string>;
    getUILanguage: Mock<() => string>;
  };
  tabs: {
    query: Mock;
  };
  action: {
    openPopup: Mock;
  };
  commands: {
    onCommand: {
      addListener: Mock;
    };
  };
}

declare global {
  var chrome: ChromeMock;
}

export {};
