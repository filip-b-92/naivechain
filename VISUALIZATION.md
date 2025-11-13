# Naivechain Visualization Dashboard

## Overview

The Naivechain Visualization Dashboard is a comprehensive web-based interface that provides real-time visualization of blockchain operations, peer networks, and cryptographic hashing processes. This enhances the educational value of Naivechain by making blockchain concepts visually accessible.

## Features

### 🎨 Visual Components

#### 1. **Blockchain Visualization**
- **Real-time Block Display**: See blocks appear as they're mined
- **Block Details**: View index, timestamp, data, hash, and previous hash
- **Genesis Block Highlight**: Special styling for the genesis block
- **Animated Transitions**: Smooth animations when new blocks are added
- **Horizontal Scrolling**: Navigate through the entire blockchain

#### 2. **Peer Network Visualization**
- **Network Topology**: SVG-based diagram showing node connections
- **Live Peer List**: Real-time list of connected peers
- **Connection Status**: Visual indicators for active connections
- **Interactive Graph**: Animated connections between nodes

#### 3. **Hashing Visualization**
- **Input Display**: Shows all components used in hash calculation
  - Block index
  - Previous block hash
  - Timestamp
  - Block data
- **Hash Function Indicator**: Displays SHA-256 algorithm
- **Output Display**: Shows the resulting hash with glow animation
- **Real-time Updates**: Updates during block mining

#### 4. **Statistics Dashboard**
- **Block Count**: Total number of blocks in the chain
- **Peer Count**: Number of connected peers
- **Chain Validation**: Visual indicator of blockchain validity

### ⚙️ Operating Modes

#### Manual Mode
Perfect for learning and experimentation:
- **Custom Block Creation**: Enter custom data for each block
- **Manual Mining**: Mine blocks one at a time
- **Full Control**: Complete control over when blocks are created

#### Auto Mode
Great for demonstrations and testing:
- **Automatic Mining**: Blocks are mined at regular intervals
- **Configurable Interval**: Set mining frequency (1-60 seconds)
- **Auto-generated Data**: Blocks include timestamp and counter
- **Start/Stop Controls**: Easy control over auto-mining

### 📋 Activity Log
- **Chronological Events**: All blockchain activities logged
- **Color Coding**:
  - 🟢 Success (green) - Successful operations
  - 🟡 Warning (yellow) - Warnings and info
  - 🔴 Error (red) - Error messages
- **Timestamps**: Each log entry includes time
- **Auto-scroll**: Latest entries appear at the top

## Getting Started

### Starting the Visualization

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start a single node**:
   ```bash
   HTTP_PORT=3001 P2P_PORT=6001 npm start
   ```

3. **Open your browser**:
   ```
   http://localhost:3001
   ```

### Multi-Node Setup

To visualize peer networking, start multiple nodes:

**Terminal 1** (Node 1):
```bash
HTTP_PORT=3001 P2P_PORT=6001 npm start
```

**Terminal 2** (Node 2):
```bash
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start
```

**Terminal 3** (Node 3):
```bash
HTTP_PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6001 npm start
```

Then open multiple browser tabs:
- Node 1: http://localhost:3001
- Node 2: http://localhost:3002
- Node 3: http://localhost:3003

### Docker Setup

Using Docker Compose (starts 3 connected nodes):

```bash
docker-compose up
```

Access the nodes:
- Node 1: http://localhost:3001
- Node 2: http://localhost:3002
- Node 3: http://localhost:3003

## Usage Guide

### Mining Blocks Manually

1. Switch to **Manual Mode** (default)
2. Enter your data in the text field
3. Click **"⛏️ Mine Block"** or press Enter
4. Watch the visualization update in real-time

### Auto Mining

1. Switch to **Auto Mode**
2. Set your desired interval (1-60 seconds)
3. Click **"▶️ Start Auto Mining"**
4. Watch blocks being mined automatically
5. Click **"⏹️ Stop Auto Mining"** when done

### Managing Peers

**Adding a Peer**:
1. Enter peer WebSocket address (e.g., `ws://localhost:6001`)
2. Click **"Add Peer"**
3. Watch the network diagram update

**Viewing Peers**:
- Check the peer list in the sidebar
- View the network topology diagram
- Monitor peer count in statistics

### Observing Hash Computation

When you mine a block:
1. Watch the **Hash Computation** section
2. See input values populate (index, previous hash, timestamp, data)
3. Observe the SHA-256 function indicator
4. See the output hash appear with animation

## Technical Details

### Architecture

```
naivechain/
├── main.js              # Backend server (Express + WebSocket)
└── public/              # Frontend visualization
    ├── index.html       # Dashboard structure
    ├── style.css        # Styling and animations
    └── app.js           # Interactive functionality
```

### Data Flow

1. **Frontend** polls backend every 3 seconds
2. **Backend** serves blockchain and peer data via REST API
3. **Real-time updates** through periodic polling
4. **User actions** trigger API calls (mine, add peer)

### API Endpoints

All original endpoints are preserved:

- `GET /blocks` - Retrieve blockchain
- `POST /mineBlock` - Mine a new block
- `GET /peers` - Get connected peers
- `POST /addPeer` - Add a new peer

Plus:
- `GET /` - Visualization dashboard
- `GET /index.html` - Dashboard HTML
- `GET /style.css` - Dashboard CSS
- `GET /app.js` - Dashboard JavaScript

## Keyboard Shortcuts

- **Enter** in block data field → Mine block
- **Enter** in peer address field → Add peer

## Browser Compatibility

Works best in modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (limited support)

## Performance

- **Automatic Optimization**: Updates pause when tab is not visible
- **Efficient Polling**: 3-second intervals balance responsiveness and performance
- **Log Limiting**: Activity log limited to 50 entries
- **Smooth Animations**: CSS-based animations for optimal performance

## Customization

### Changing Colors

Edit `public/style.css` variables:

```css
:root {
    --primary-color: #3498db;    /* Main theme color */
    --secondary-color: #2ecc71;  /* Success/peer color */
    --danger-color: #e74c3c;     /* Error color */
    --accent-color: #00d9ff;     /* Highlight color */
    --block-color: #533483;      /* Block background */
    --genesis-color: #27ae60;    /* Genesis block */
}
```

### Adjusting Update Frequency

In `public/app.js`, modify:

```javascript
// Change from 3000ms (3s) to desired interval
setInterval(() => {
    fetchBlockchain();
    fetchPeers();
}, 3000);
```

## Educational Benefits

### Understanding Blockchain
- **Visual Learning**: See how blocks chain together
- **Hash Relationships**: Understand how hashes link blocks
- **Immutability**: Observe the chain structure

### Understanding P2P Networks
- **Network Topology**: See peer connections
- **Synchronization**: Watch blocks propagate across nodes
- **Decentralization**: Run multiple nodes simultaneously

### Understanding Cryptography
- **Hash Functions**: See SHA-256 in action
- **Hash Inputs**: Understand what data creates a hash
- **Hash Properties**: Observe deterministic hash generation

## Troubleshooting

### Dashboard not loading
- Ensure `public/` directory exists with all files
- Check browser console for errors
- Verify server is running: `curl http://localhost:3001/blocks`

### Peers not appearing
- Ensure nodes are on different ports
- Check P2P ports are not blocked
- Verify PEERS environment variable is set correctly

### Blocks not syncing
- Check network connectivity between nodes
- Verify WebSocket connections in browser console
- Ensure all nodes are running

## Future Enhancements

Potential additions:
- Real WebSocket support for instant updates
- Transaction visualization
- Mining difficulty visualization
- Block validation animation
- Network latency indicators
- Export/import blockchain data
- Mobile responsive design improvements

## Credits

Built on top of [Naivechain](https://github.com/lhartikk/naivechain) by Lauri Hartikka.

Visualization dashboard adds comprehensive visual elements while maintaining the simplicity of the original 200-line blockchain implementation.
