# ChatJump Sidebar Extension

## Description
ChatJump is a browser sidebar extension designed to help you quickly find and jump to your own questions in the ChatGPT UI. It scans your conversation, lists your messages in a sidebar, and lets you smoothly scroll to any selected message with a highlight effect.

## Features
- Detects and lists all your user messages from ChatGPT interface.
- Click on any message in the sidebar to jump directly to it in the chat.
- Refresh and clear message list buttons.
- Draggable sidebar window.
- Automatically updates as new messages appear.
- Saves message list locally for quick access.
- Lightweight and easy to use.

## Installation
1. Download or clone this repository.
2. Open Google Chrome or any Chromium-based browser.
3. Go to `chrome://extensions/`
4. Enable **Developer Mode** (toggle on top right).
5. Click **Load unpacked** and select the folder where this project is located.
6. Navigate to [https://chat.openai.com](https://chat.openai.com) and start using the sidebar extension.

## Usage
- Click the 👋 toggle button on the right side of the screen to show/hide the sidebar.
- The sidebar will display all your user questions detected in the current ChatGPT conversation.
- Click on any listed question to jump to it in the chat area.
- Use the Refresh button to rescan messages.
- Use the Clear button to clear saved message history.

## How it works
- The extension scans the main chat container for message nodes.
- It detects messages based on their position and text content.
- User messages are identified as those appearing on the right side of the chat.
- The detected messages are stored in localStorage and displayed in the sidebar.
- Clicking a sidebar item scrolls to that message in the chat window and highlights it.

## Technologies
- JavaScript (ES6)
- CSS (for styling and animations)
- LocalStorage API
- MutationObserver for dynamic chat updates

## Contributing
Feel free to fork the repository and submit pull requests. Issues and suggestions are welcome!

## License
This project is licensed under the MIT License.

---

**GitHub Repository:**  
[https://github.com/chandrakantteotia/chatgpt-user-sidebar-ext](https://github.com/chandrakantteotia/chatjump.git)

