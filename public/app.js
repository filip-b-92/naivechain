// Application State
const state = {
    blockchain: [],
    peers: [],
    autoMining: false,
    autoMiningInterval: null,
    nodePort: window.location.port || '3001',
    ws: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    startPeriodicUpdates();
});

function initializeApp() {
    // Set node port
    document.getElementById('nodePort').textContent = `:${state.nodePort}`;

    // Initial data fetch
    fetchBlockchain();
    fetchPeers();

    // Initialize WebSocket for real-time updates
    initWebSocket();

    addLog('Application initialized', 'success');
}

// WebSocket for real-time updates
function initWebSocket() {
    // Note: This connects to the P2P port for monitoring
    // In production, you'd want a dedicated WebSocket endpoint
    const p2pPort = parseInt(state.nodePort) + 3000; // P2P port offset

    addLog(`Connecting to node on port ${state.nodePort}...`);
}

// Event Listeners
function setupEventListeners() {
    // Mode switching
    document.getElementById('modeManual').addEventListener('click', () => switchMode('manual'));
    document.getElementById('modeAuto').addEventListener('click', () => switchMode('auto'));

    // Manual controls
    document.getElementById('mineBtn').addEventListener('click', mineBlock);
    document.getElementById('blockData').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') mineBlock();
    });

    // Auto controls
    document.getElementById('autoStartBtn').addEventListener('click', startAutoMining);
    document.getElementById('autoStopBtn').addEventListener('click', stopAutoMining);

    // Peer management
    document.getElementById('addPeerBtn').addEventListener('click', addPeer);
    document.getElementById('peerAddress').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPeer();
    });
}

// Mode Switching
function switchMode(mode) {
    const manualBtn = document.getElementById('modeManual');
    const autoBtn = document.getElementById('modeAuto');
    const manualControls = document.getElementById('manualControls');
    const autoControls = document.getElementById('autoControls');

    if (mode === 'manual') {
        manualBtn.classList.add('active');
        autoBtn.classList.remove('active');
        manualControls.classList.remove('hidden');
        autoControls.classList.add('hidden');
        if (state.autoMining) stopAutoMining();
        addLog('Switched to Manual Mode', 'success');
    } else {
        autoBtn.classList.add('active');
        manualBtn.classList.remove('active');
        autoControls.classList.remove('hidden');
        manualControls.classList.add('hidden');
        addLog('Switched to Auto Mode', 'success');
    }
}

// Blockchain Operations
async function fetchBlockchain() {
    try {
        const response = await fetch(`http://localhost:${state.nodePort}/blocks`);
        const data = await response.json();
        state.blockchain = data;
        updateBlockchainVisualization();
        updateStatistics();
    } catch (error) {
        addLog(`Error fetching blockchain: ${error.message}`, 'error');
    }
}

async function mineBlock() {
    const dataInput = document.getElementById('blockData');
    const data = dataInput.value.trim();

    if (!data) {
        addLog('Please enter block data', 'warning');
        return;
    }

    try {
        // Show hashing visualization
        const latestBlock = state.blockchain[state.blockchain.length - 1];
        const nextIndex = latestBlock.index + 1;
        const timestamp = new Date().getTime() / 1000;

        visualizeHashing(nextIndex, latestBlock.hash, timestamp, data);

        const response = await fetch(`http://localhost:${state.nodePort}/mineBlock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });

        if (response.ok) {
            addLog(`Block mined successfully with data: "${data}"`, 'success');
            dataInput.value = '';

            // Wait a bit for the block to propagate
            setTimeout(() => {
                fetchBlockchain();
            }, 500);
        }
    } catch (error) {
        addLog(`Error mining block: ${error.message}`, 'error');
    }
}

// Auto Mining
function startAutoMining() {
    const interval = parseInt(document.getElementById('autoInterval').value) * 1000;

    if (state.autoMining) return;

    state.autoMining = true;
    document.getElementById('autoStartBtn').classList.add('hidden');
    document.getElementById('autoStopBtn').classList.remove('hidden');

    let blockCounter = 1;
    state.autoMiningInterval = setInterval(async () => {
        const autoData = `Auto-generated block #${blockCounter} at ${new Date().toLocaleTimeString()}`;

        try {
            const latestBlock = state.blockchain[state.blockchain.length - 1];
            const nextIndex = latestBlock.index + 1;
            const timestamp = new Date().getTime() / 1000;

            visualizeHashing(nextIndex, latestBlock.hash, timestamp, autoData);

            const response = await fetch(`http://localhost:${state.nodePort}/mineBlock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: autoData })
            });

            if (response.ok) {
                addLog(`Auto-mined block #${blockCounter}`, 'success');
                blockCounter++;
                setTimeout(() => fetchBlockchain(), 500);
            }
        } catch (error) {
            addLog(`Auto-mining error: ${error.message}`, 'error');
        }
    }, interval);

    addLog(`Auto mining started (interval: ${interval / 1000}s)`, 'success');
}

function stopAutoMining() {
    if (!state.autoMining) return;

    state.autoMining = false;
    clearInterval(state.autoMiningInterval);

    document.getElementById('autoStopBtn').classList.add('hidden');
    document.getElementById('autoStartBtn').classList.remove('hidden');

    addLog('Auto mining stopped', 'warning');
}

// Peer Management
async function fetchPeers() {
    try {
        const response = await fetch(`http://localhost:${state.nodePort}/peers`);
        const data = await response.json();
        state.peers = data;
        updatePeerVisualization();
        updateStatistics();
    } catch (error) {
        addLog(`Error fetching peers: ${error.message}`, 'error');
    }
}

async function addPeer() {
    const peerInput = document.getElementById('peerAddress');
    const peer = peerInput.value.trim();

    if (!peer) {
        addLog('Please enter a peer address', 'warning');
        return;
    }

    try {
        const response = await fetch(`http://localhost:${state.nodePort}/addPeer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ peer })
        });

        if (response.ok) {
            addLog(`Peer added: ${peer}`, 'success');
            peerInput.value = '';
            setTimeout(() => fetchPeers(), 1000);
        }
    } catch (error) {
        addLog(`Error adding peer: ${error.message}`, 'error');
    }
}

// Visualization Functions
function updateBlockchainVisualization() {
    const container = document.getElementById('blockchain');
    container.innerHTML = '';

    state.blockchain.forEach((block, index) => {
        const blockEl = createBlockElement(block, index === 0);
        container.appendChild(blockEl);

        // Add animation for new blocks
        if (index === state.blockchain.length - 1 && index > 0) {
            setTimeout(() => blockEl.classList.add('new-block'), 100);
        }
    });

    // Scroll to the latest block
    container.scrollLeft = container.scrollWidth;
}

function createBlockElement(block, isGenesis = false) {
    const blockEl = document.createElement('div');
    blockEl.className = `block ${isGenesis ? 'genesis' : ''}`;

    const date = new Date(block.timestamp * 1000);
    const timeStr = date.toLocaleTimeString();

    blockEl.innerHTML = `
        <div class="block-header">
            <div class="block-index">#${block.index}</div>
            <div class="block-time">${timeStr}</div>
        </div>
        <div class="block-field">
            <div class="block-label">Data</div>
            <div class="block-value">${truncateString(block.data, 30)}</div>
        </div>
        <div class="block-field">
            <div class="block-label">Hash</div>
            <div class="block-value block-hash">${truncateString(block.hash, 16)}</div>
        </div>
        <div class="block-field">
            <div class="block-label">Previous Hash</div>
            <div class="block-value block-hash">${truncateString(block.previousHash, 16)}</div>
        </div>
    `;

    return blockEl;
}

function updatePeerVisualization() {
    const peerList = document.getElementById('peerList');

    if (state.peers.length === 0) {
        peerList.innerHTML = '<p class="empty-state">No peers connected</p>';
    } else {
        peerList.innerHTML = '';
        state.peers.forEach(peer => {
            const peerEl = document.createElement('div');
            peerEl.className = 'peer-item';
            peerEl.innerHTML = `
                <div class="peer-status"></div>
                <div class="peer-address">${peer}</div>
            `;
            peerList.appendChild(peerEl);
        });
    }

    // Update network diagram
    updateNetworkDiagram();
}

function updateNetworkDiagram() {
    const svg = document.getElementById('networkSvg');
    const width = svg.clientWidth;
    const height = 300;

    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Current node (center)
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw current node
    const currentNode = createSVGElement('g', { class: 'network-node' });
    currentNode.innerHTML = `
        <circle cx="${centerX}" cy="${centerY}" r="30" fill="#3498db" />
        <text x="${centerX}" y="${centerY}" text-anchor="middle" dy=".3em" fill="white" font-weight="bold">
            YOU
        </text>
    `;
    svg.appendChild(currentNode);

    // Draw peers in a circle around the center
    const radius = 100;
    state.peers.forEach((peer, index) => {
        const angle = (index * 2 * Math.PI) / Math.length || 0;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Draw connection line
        const line = createSVGElement('line', {
            x1: centerX,
            y1: centerY,
            x2: x,
            y2: y,
            class: 'network-link',
            'stroke-dasharray': '5,5'
        });
        svg.appendChild(line);

        // Draw peer node
        const peerNode = createSVGElement('g', { class: 'network-node' });
        peerNode.innerHTML = `
            <circle cx="${x}" cy="${y}" r="25" fill="#2ecc71" />
            <text x="${x}" y="${y}" text-anchor="middle" dy=".3em" fill="white" font-size="12">
                P${index + 1}
            </text>
        `;
        svg.appendChild(peerNode);

        // Add label below
        const label = createSVGElement('text', {
            x: x,
            y: y + 40,
            'text-anchor': 'middle',
            fill: '#a8b2d1',
            'font-size': '10'
        });
        label.textContent = truncateString(peer, 15);
        svg.appendChild(label);
    });
}

function visualizeHashing(index, previousHash, timestamp, data) {
    // Update input fields
    document.getElementById('hashIndex').textContent = index;
    document.getElementById('hashPrevHash').textContent = truncateString(previousHash, 20);
    document.getElementById('hashTimestamp').textContent = timestamp.toFixed(0);
    document.getElementById('hashData').textContent = truncateString(data, 30);

    // Simulate hash computation (using the same algorithm as the server)
    const hashInput = `${index}${previousHash}${timestamp}${data}`;

    // Show computing animation
    const outputEl = document.getElementById('outputHash');
    outputEl.textContent = 'Computing...';

    // Simulate computation delay
    setTimeout(() => {
        // Note: We don't have CryptoJS on the client, so we'll just show a placeholder
        // In a real implementation, you'd compute the actual hash
        outputEl.textContent = 'Hash computed by server...';

        // After mining, we'll update with the actual hash
        setTimeout(() => {
            if (state.blockchain.length > 0) {
                const latestBlock = state.blockchain[state.blockchain.length - 1];
                outputEl.textContent = latestBlock.hash;
            }
        }, 1000);
    }, 500);
}

function updateStatistics() {
    document.getElementById('blockCount').textContent = state.blockchain.length;
    document.getElementById('peerCount').textContent = state.peers.length;

    // Validate chain (simple check)
    const isValid = state.blockchain.length > 0;
    document.getElementById('chainValid').textContent = isValid ? '✓' : '✗';
    document.getElementById('chainValid').style.color = isValid ? '#2ecc71' : '#e74c3c';
}

// Activity Log
function addLog(message, type = '') {
    const log = document.getElementById('activityLog');
    const timestamp = new Date().toLocaleTimeString();

    const entry = document.createElement('p');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;

    log.insertBefore(entry, log.firstChild);

    // Limit log entries
    while (log.children.length > 50) {
        log.removeChild(log.lastChild);
    }
}

// Utility Functions
function truncateString(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([key, value]) => {
        el.setAttribute(key, value);
    });
    return el;
}

// Periodic Updates
function startPeriodicUpdates() {
    // Update blockchain and peers every 3 seconds
    setInterval(() => {
        fetchBlockchain();
        fetchPeers();
    }, 3000);
}

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause updates when tab is not visible
    } else {
        // Resume and immediately fetch
        fetchBlockchain();
        fetchPeers();
    }
});
