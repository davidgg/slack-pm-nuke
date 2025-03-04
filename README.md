# Slack PM Nuke

A Chrome extension that allows you to quickly and securely delete all your private messages from any Slack conversation with a single click.

## Features

- Delete all your messages from the current Slack conversation
- Simple one-click operation
- Works with direct messages, group chats, and channels

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store page for Slack PM Nuke
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `dist` folder containing the extension files
5. The extension should now appear in your Chrome toolbar

## Usage

1. Log in to your Slack workspace in Chrome
2. Navigate to the Slack conversation you want to clean up
3. Click the Slack PM Nuke icon in your Chrome toolbar
4. Confirm that you want to delete all your messages from the current conversation
5. Wait for the process to complete (this may take some time depending on the number of messages)

## Project Structure

- `chrome-store/`: Contains assets for Chrome Web Store listing (screenshots, descriptions)
- `dist/`: Contains the final extension code ready for distribution
- `scripts/`: Utility scripts, including SVG to PNG conversion for icons
- `src/icons/`: Source SVG files for extension icons

## Development

### Icon Generation

The extension uses SVG source files for icons, which are converted to PNG files for use in the Chrome extension.

To generate PNG icons from the SVG source files:

1. Install dependencies:

   ```
   npm install
   ```

2. Create or modify SVG icons in the `src/icons/` directory:

   - `icon.svg`: Main icon used for all extension sizes (16x16, 48x48, 128x128)
   - `store-icon.svg`: Icon used for the Chrome Web Store listing (128x128)

3. Run the icon generation script:

   ```
   npm run build-icons
   ```

   This will convert the SVG files to PNG files in the appropriate sizes and place them in the following locations:

   - Extension icons: `dist/images/icon16.png`, `dist/images/icon48.png`, `dist/images/icon128.png`
   - Chrome Store icon: `chrome-store/store-icon.png`

4. Alternatively, you can run the full build process which includes icon generation:

   ```
   npm run build
   ```

5. To preview the generated icons, open `scripts/preview-icons.html` in your browser.

### Dependencies

- The icon generation script requires the `sharp` library for image processing, which is installed as a dev dependency.

## Privacy & Security

- Slack PM Nuke operates entirely within your browser
- No data is sent to external servers
- Your Slack credentials and tokens remain secure in your browser
- The extension only accesses the specific conversation you're currently viewing

## Limitations

- The extension can only delete messages that you have permission to delete (your own messages)
- Some workspaces may have retention policies that prevent message deletion
- The extension requires a stable internet connection during the deletion process

## Troubleshooting

If you encounter issues:

1. Make sure you're logged into Slack in the same browser
2. Refresh the Slack page and try again
3. Ensure you have a stable internet connection
4. If problems persist, try reinstalling the extension

## License

MIT License

## Disclaimer

This extension is not affiliated with, endorsed by, or connected to Slack Technologies, Inc. in any way. Use at your own risk.

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.
