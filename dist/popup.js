document.addEventListener("DOMContentLoaded", function () {
  const deleteBtn = document.getElementById("delete-btn");
  const statusMessage = document.getElementById("status-message");

  // Check if we're on a valid Slack page when popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = tabs[0].url;
    if (!currentUrl.includes("slack.com")) {
      statusMessage.textContent =
        "Please navigate to a Slack conversation to use this extension.";
      deleteBtn.disabled = true;
    }
  });

  // Delete messages
  deleteBtn.addEventListener("click", function () {
    if (
      !confirm(
        "Are you sure you want to remove all of your messages from this conversation? This can't be undone."
      )
    ) {
      return;
    }

    statusMessage.textContent = "Starting deletion process...";

    // Send message to content script to start deletion
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log("Sending message to content script:", tabs[0].id);

      // First, try to inject the scripts if they're not already there
      chrome.scripting
        .executeScript({
          target: { tabId: tabs[0].id },
          files: ["remover.js", "content_script.js"],
        })
        .then(() => {
          console.log("Scripts injected successfully");

          // Now send the message
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "startDeletion" },
            function (response) {
              // Check for runtime.lastError
              if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError.message);
                statusMessage.textContent =
                  "Error: Could not connect to Slack page. Make sure you're on a Slack conversation and refresh the page if needed.";
                return;
              }

              if (response && response.success) {
                statusMessage.textContent =
                  "Deletion process started. You can close this popup, but keep the Slack tab open until the process completes.";
              } else {
                statusMessage.textContent =
                  response && response.error
                    ? response.error
                    : "Could not start deletion process. Make sure you are on a Slack conversation page.";
              }
            }
          );
        })
        .catch((err) => {
          console.error("Error injecting scripts:", err);
          statusMessage.textContent =
            "Error: Could not inject scripts. " + err.message;
        });
    });
  });
});
