(function () {
  const MESSAGE_SELECTOR = "[data-qa='message_container']";
  const MESSAGE_HOVER_SELECTOR = "[data-qa-hover]";
  const MENU_MORE_ACTIONS_SELECTOR = "[data-qa='more_message_actions']";
  const POPUP_MORE_ACTIONS_SELECTOR = "[data-qa='menu']";
  const MENU_DELETE_BUTTON_SELECTOR =
    "[data-qa='delete_message-wrapper'] [data-qa='delete_message']";
  const MODAL_REMOVE_CONFIRMATION_SELECTOR = "[data-qa='dialog_go']";
  const HARD_LIMIT_PAGE_PROCESS = 10_000;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const waitUntilElementIsVisible = (selector) =>
    new Promise((resolve) => {
      let tries = 0;

      const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(interval);
          resolve(element);
          return;
        }

        tries++;
        if (tries > 10) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });

  function getAllCurrentMessages() {
    return document.querySelectorAll(MESSAGE_SELECTOR);
  }

  async function goFocusAndUp(message) {
    const eventUp = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      code: "ArrowUp",
      keyCode: 38,
      bubbles: true,
    });

    message.focus();
    message.dispatchEvent(eventUp);
    await wait(100);
  }

  async function removeAllIfPossible(messages) {
    for (let message of messages) {
      await removeMessageIfPossible(message);
    }
  }

  async function removeMessageIfPossible(message) {
    try {
      message.click();
      message.scrollIntoView();
      message.focus();
      await wait(100);

      triggerHover(message);
      await waitUntilElementIsVisible(MENU_MORE_ACTIONS_SELECTOR);

      showMoreActionsMenu(message);
      await waitUntilElementIsVisible(POPUP_MORE_ACTIONS_SELECTOR);

      if (!document.querySelector(MENU_DELETE_BUTTON_SELECTOR)) {
        return;
      }
      clickDeleteMenuButton();
      await waitUntilElementIsVisible(MODAL_REMOVE_CONFIRMATION_SELECTOR);

      await wait(500);
      clickRemoveConfirmationButton();
    } catch (error) {
      console.error("Error removing message:", error);
    }
  }

  function triggerHover(message) {
    const event = new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    message.querySelector(MESSAGE_HOVER_SELECTOR).dispatchEvent(event);
  }

  function showMoreActionsMenu(message) {
    const menu = message.querySelector(MENU_MORE_ACTIONS_SELECTOR);
    if (menu) {
      menu.click();
    }
  }

  function clickDeleteMenuButton() {
    const deleteButton = document.querySelector(MENU_DELETE_BUTTON_SELECTOR);
    if (deleteButton) {
      deleteButton.click();
    }
  }

  function clickRemoveConfirmationButton() {
    const removeConfirmationButton = document.querySelector(
      MODAL_REMOVE_CONFIRMATION_SELECTOR
    );
    if (removeConfirmationButton) {
      removeConfirmationButton.click();
    }
  }

  window.removeAllMessages = async () => {
    const visited = new Set();
    let scrolled = false;
    let page = 0;

    do {
      const pageMessages = getAllCurrentMessages();
      const firstTryRemoveMessages = Array.from(pageMessages).filter(
        (message) => !visited.has(message)
      );

      await removeAllIfPossible(firstTryRemoveMessages);
      firstTryRemoveMessages.forEach((message) => visited.add(message));

      if (
        firstTryRemoveMessages.length === 0 &&
        pageMessages.length &&
        !scrolled
      ) {
        await goFocusAndUp(pageMessages[0]);
        scrolled = true;
      } else if (firstTryRemoveMessages.length === 0 && scrolled) {
        return;
      } else {
        scrolled = false;
      }

      page++;
    } while (true && page < HARD_LIMIT_PAGE_PROCESS);
  };
})();
