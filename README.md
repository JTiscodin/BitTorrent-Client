# Torrent Peer Tracker

This project is a simple UDP-based tracker for BitTorrent files. It connects to a torrent tracker, retrieves a list of peers, and can be extended to download files using the retrieved peers.

## Features

- Connects to a specified torrent tracker using UDP.
- Retrieves a list of peers for the given torrent file.
- Supports both single-file and multi-file torrents.
- Generates a unique peer ID for identification.
- Can be extended to download files from peers.

## Prerequisites

- Node.js (version 14 or later)
- npm (Node package manager)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/torrent-peer-tracker.git
   cd torrent-peer-tracker
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

## Usage

1. Place your `.torrent` file in the root directory of the project.

2. Run the tracker with the following command, replacing `yourfile.torrent` with the name of your torrent file:
   ```bash
   node index.js yourfile.torrent
   ```

3. The program will output the list of peers connected to the torrent.

## Code Overview

- **src/tracker.js**: Contains the logic for connecting to the tracker, sending requests, and processing responses.
- **src/utils.js**: Provides utility functions, including generating a unique peer ID.
- **src/torrent-parser.js**: Handles parsing of the torrent file and extracting necessary information such as size and info hash.
- **index.js**: The entry point of the application that initializes the tracker and starts the peer retrieval process.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## Acknowledgements

- [bencode](https://www.npmjs.com/package/bencode) for decoding torrent files.
- [crypto](https://nodejs.org/api/crypto.html) for generating secure IDs.
- [dgram](https://nodejs.org/api/dgram.html) for UDP socket communication.
