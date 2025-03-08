function updateStatusMessage(message) {
  const statusMessageElement = document.getElementById('status-message');
  if (!statusMessageElement) {
    return;
  }

  statusMessageElement.textContent = message;
}

function checkSlackPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = tabs[0].url;
    if (!currentUrl.includes('slack.com')) {
      updateStatusMessage('Please navigate to a Slack conversation to use this extension.');
      deleteBtn.disabled = true;
    }
  });
}

function confirmDeletion() {
  return confirm("Are you sure you want to remove all of your messages from this conversation? This can't be undone.");
}

function deleteMessages() {
  if (!confirmDeletion()) {
    return;
  }

  updateStatusMessage(
    'Starting deletion process... You can close this popup, but keep the Slack tab open until the process completes.'
  );

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting
      .executeScript({
        target: { tabId: tabs[0].id },
        files: ['remover.js', 'content_script.js'],
      })
      .then(() => {
        console.log('Scripts injected successfully');

        chrome.tabs.sendMessage(tabs[0].id, { action: 'startDeletion' }, function (response) {
          // Check for runtime.lastError
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError.message);
            updateStatusMessage(
              "Error: Could not connect to Slack page. Make sure you're on a Slack conversation and refresh the page if needed."
            );
            return;
          }

          if (response && response.success) {
            updateStatusMessage('Completed');
          } else if (response && response.error) {
            updateStatusMessage(response.error);
          } else {
            updateStatusMessage('Could not start deletion process. Make sure you are on a Slack conversation page.');
          }
        });
      })
      .catch((err) => {
        console.error('Error injecting scripts:', err);
        updateStatusMessage('Error: Could not inject scripts. ' + err.message);
      });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  checkSlackPage();

  const deleteBtn = document.getElementById('delete-btn');

  if (!deleteBtn) {
    return;
  }

  deleteBtn.addEventListener('click', deleteMessages);
});
