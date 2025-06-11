# Healthy Work Habits - Firefox Extension

A Firefox browser extension that promotes healthy work habits by displaying customizable reminders every 25 minutes to take brief standing breaks.
[![Netlify Status](https://api.netlify.com/api/v1/badges/a89565ae-25a2-4f49-8565-6a540d4e9a90/deploy-status)](https://app.netlify.com/projects/dulcet-khapse-4c4c60/deploys)
## Features

- **Automatic Time Tracking**: Tracks active browser time and reminds you to take breaks
- **Customizable Intervals**: Set break reminders from 15 to 60 minutes (default: 25 minutes)
- **Multiple Notification Styles**: Choose from banner, popup, system notifications, or sound alerts
- **Motivational Messages**: Built-in inspirational messages with ability to add custom ones
- **Pause/Resume Function**: Temporarily pause tracking when needed
- **Progress Statistics**: Track your total work time and break compliance
- **Modern UI**: Beautiful, intuitive interface with smooth animations

## Installation

### From Firefox Add-ons Store (Coming Soon)
The extension will be available on the official Firefox Add-ons store.

### Manual Installation (For Development)
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the extension folder and select `manifest.json`

## Usage

### Getting Started
1. Click the extension icon in your browser toolbar to open the popup
2. The extension will automatically start tracking your work time
3. You'll receive break reminders based on your selected interval

### Customizing Settings
- **Quick Settings**: Use the popup for basic settings like interval and notification style
- **Advanced Settings**: Click "Advanced Settings" in the popup for detailed configuration
- **Custom Messages**: Add your own motivational messages in the options page
- **Statistics**: View your work time and break compliance in the options page

### Notification Styles
- **Banner**: Non-intrusive banner at the top of the current page
- **Popup**: Modal dialog in the center of the screen
- **System**: Native browser notification
- **Sound**: Audio notification with optional banner

## Development

### Project Structure
```
├── manifest.json           # Extension manifest
├── background.js          # Background script for time tracking
├── popup.html/js          # Extension popup interface
├── options.html/js        # Options page for detailed settings
├── content.js/css         # Content scripts for in-page notifications
├── icons/                 # Extension icons
└── README.md             # This file
```

### Key Components
- **Background Script**: Manages time tracking, alarms, and data storage
- **Popup Interface**: Quick access to status and basic settings
- **Options Page**: Comprehensive settings and statistics
- **Content Scripts**: Handle in-page notifications and user interactions

### Building
The extension uses standard WebExtensions APIs and requires no build process. Simply load the extension files into Firefox for development.

## Privacy

- All data is stored locally in your browser
- No personal information is collected or transmitted
- Break compliance tracking is optional and local only

## Browser Compatibility

- Firefox 60+
- Uses WebExtensions APIs for cross-browser compatibility
- Manifest v2 for maximum Firefox compatibility

## License

MIT License - feel free to modify and distribute as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to improve the extension.

## Support

If you encounter any issues or have feature requests, please open an issue on the project repository.
