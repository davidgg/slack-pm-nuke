(function () {
  const MESSAGE_SELECTOR = "[data-qa='message_container']";
  const MESSAGE_HOVER_SELECTOR = '[data-qa-hover]';
  const MENU_MORE_ACTIONS_SELECTOR = "[data-qa='more_message_actions']";
  const POPUP_MORE_ACTIONS_SELECTOR = "[data-qa='menu']";
  const MENU_DELETE_BUTTON_SELECTOR = "[data-qa='delete_message-wrapper'] [data-qa='delete_message']";
  const MODAL_REMOVE_CONFIRMATION_SELECTOR = "[data-qa='dialog_go']";
  const MODAL_BACKDROP_SELECTOR = '.ReactModal__Overlay';
  const HARD_LIMIT_PAGE_PROCESS = 10_000;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const getMessageId = (message) => message.parentElement.getAttribute('id');
  const focusMessage = async (message) => {
    message.scrollIntoView(true);
    message.focus();
    message.click();
    await wait(100);
  };

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
    const eventUp = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      code: 'ArrowUp',
      keyCode: 38,
      bubbles: true,
    });

    await focusMessage(message);
    message.dispatchEvent(eventUp);
    await wait(2000);
  }

  async function removeAllIfPossible(messages) {
    for (let message of messages) {
      await removeMessageIfPossible(message);
    }
  }

  async function removeMessageIfPossible(message) {
    try {
      message.click();
      await focusMessage(message);

      triggerHover(message);
      await waitUntilElementIsVisible(MENU_MORE_ACTIONS_SELECTOR);

      showMoreActionsMenu(message);
      await waitUntilElementIsVisible(POPUP_MORE_ACTIONS_SELECTOR);

      if (!document.querySelector(MENU_DELETE_BUTTON_SELECTOR)) {
        hideMoreActionsMenu();
        return;
      }

      clickDeleteMenuButton();
      await waitUntilElementIsVisible(MODAL_REMOVE_CONFIRMATION_SELECTOR);

      await wait(300);
      clickRemoveConfirmationButton();
    } catch (error) {
      console.error('Error removing message:', error);
    }
  }

  function triggerHover(message) {
    const event = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    const hoverElement = message.querySelector(MESSAGE_HOVER_SELECTOR);
    if (hoverElement) {
      hoverElement.dispatchEvent(event);
    }
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
    const removeConfirmationButton = document.querySelector(MODAL_REMOVE_CONFIRMATION_SELECTOR);
    if (removeConfirmationButton) {
      removeConfirmationButton.click();
    }
    hideMoreActionsMenu();
  }

  function hideMoreActionsMenu() {
    const backdrop = document.querySelector(MODAL_BACKDROP_SELECTOR);
    if (backdrop) {
      backdrop.click();
    }
  }

  window.removeAllMessages = async () => {
    // message id's
    const visited = new Set();
    let scrollRetries = 0;
    let page = 0;

    do {
      const pageMessages = getAllCurrentMessages();
      const firstTryRemoveMessages = Array.from(pageMessages)
        .filter((message) => !visited.has(getMessageId(message)))
        .reverse();

      if (firstTryRemoveMessages.length) {
        await removeAllIfPossible(firstTryRemoveMessages);
        firstTryRemoveMessages.forEach((message) => visited.add(getMessageId(message)));
      } else if (pageMessages.length && !scrollRetries) {
        await goFocusAndUp(pageMessages[0]);
        scrollRetries++;
      } else if (scrollRetries === 10) {
        return;
      } else {
        scrollRetries = 0;
      }

      page++;
    } while (page < HARD_LIMIT_PAGE_PROCESS);
  };
})();
