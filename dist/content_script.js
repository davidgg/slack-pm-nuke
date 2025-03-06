// Slack PM Nuke - Content Script
// This script interacts with the Slack web interface to delete messages

// Log when the content script is loaded
console.log("Slack PM Nuke content script loaded on:", window.location.href);

// Check if remover.js is loaded properly
if (typeof window.removeAllMessages !== "function") {
  console.error(
    "Warning: removeAllMessages function not found. remover.js may not be loaded correctly."
  );
}

// Flag to track if listener is already registered
let isListenerRegistered = false;

// Remove any existing listeners (cleanup)
chrome.runtime.onMessage.removeListener(messageHandler);

// Define the message handler function separately
function messageHandler(request, sender, sendResponse) {
  if (request.action === "startDeletion") {
    // Check if we're on a Slack page
    if (!window.location.href.includes("slack.com")) {
      console.error("Not on a Slack page");
      sendResponse({
        success: false,
        error: "Not on a Slack page. Please navigate to a Slack conversation.",
      });
      return true;
    }

    // Start the deletion process
    (async function () {
      try {
        // Call the removeAllMessages function from remover.js
        if (typeof window.removeAllMessages === "function") {
          await window.removeAllMessages();

          sendResponse({ success: true });
        } else {
          console.error("removeAllMessages function not found");
          sendResponse({
            success: false,
            error:
              "Deletion function not found. Please refresh the page and try again.",
          });
        }
      } catch (error) {
        console.error("Error starting deletion process:", error);
        sendResponse({
          success: false,
          error: "Error starting deletion process: " + error.message,
        });
      }
    })();

    return true; // Keep the message channel open for async response
  }

  // Always return true for unhandled messages
  return true;
}

// Register the listener only if not already registered
if (!isListenerRegistered) {
  chrome.runtime.onMessage.addListener(messageHandler);
  isListenerRegistered = true;
}
