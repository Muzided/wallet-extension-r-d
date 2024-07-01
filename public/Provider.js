class SoccoProvider {
    constructor() {
        this.events = {};
        this.accounts = [];
        this.currentAccount = null;
        this.currentChainId = '0x1'; // Default to Mainnet
        this.providerInfo = {
            uuid: this.generateUUID(),
            name: 'Socco',
            icon: 'data:image/png;base64,...', // Ensure this is a valid data URI
            rdns: 'socco.io'
        };

        // Load state from local storage or initialize default state
        this.loadState();
    }

    // Simulated request method
    request = async ({ method, params }) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                switch (method) {
                    case 'eth_requestAccounts':
                        this.connect().then(result => resolve(this.accounts));
                        break;
                    case 'eth_chainId':
                        resolve(this.currentChainId);
                        break;
                    default:
                        reject(new Error('Unsupported method'));
                }
            }, 1000);
        });
    };

    // Method to send messages to background.js
    sendMessageToBackground = (message) => {
        chrome.runtime.sendMessage("fpecfhcaielakdjijpnmdhjhhafkcgeg", message, (response) => {
            console.log('Response from background.js:', response);
            if (response && response.accounts) {
                this.updateAccounts(response.accounts);
            }
            if (response && response.chainId) {
                this.updateChainId(response.chainId);
            }
        });
    };

    // Example method to connect
    connect = () => {
        return new Promise((resolve, reject) => {
            this.sendMessageToBackground({ action: 'connect' });
            setTimeout(() => {
                if (this.accounts.length > 0) {
                    this.currentAccount = this.accounts[0];
                    this.emit('accountsChanged', this.accounts);
                    resolve(this.accounts);
                } else {
                    reject(new Error('No accounts available'));
                }
            }, 1000);
        });
    };

    // Example method to disconnect
    disconnect = () => {
        this.sendMessageToBackground({ action: 'disconnect' });
        this.accounts = [];
        this.currentAccount = null;
        this.emit('accountsChanged', this.accounts);
    };

    // Method to handle account changes
    updateAccounts = (accounts) => {
        this.accounts = accounts;
        if (this.accounts.length > 0) {
            this.currentAccount = this.accounts[0];
        } else {
            this.currentAccount = null;
        }
        this.emit('accountsChanged', this.accounts);
        this.saveState();
    };

    // Method to handle chain ID changes
    updateChainId = (chainId) => {
        this.currentChainId = chainId;
        this.emit('chainChanged', this.currentChainId);
        this.saveState();
    };

    // Simulated account change
    changeAccount = (newAccount) => {
        this.currentAccount = newAccount;
        this.emit('accountsChanged', [newAccount]);
        this.saveState();
    };

    // Simulated chain change
    changeChain = (newChainId) => {
        this.currentChainId = newChainId;
        this.emit('chainChanged', newChainId);
        this.saveState();
    };

    // Simulated disconnect
    simulateDisconnect = () => {
        this.emit('disconnect', { code: 1000, message: 'User disconnected' });
    };

    // EIP-1193 send method
    send = (methodOrPayload, callback) => {
        if (typeof methodOrPayload === 'string') {
            this.request({ method: methodOrPayload })
                .then(result => callback(null, { jsonrpc: '2.0', id: 1, result }))
                .catch(error => callback(error, null));
        } else if (typeof methodOrPayload === 'object' && methodOrPayload !== null) {
            this.request(methodOrPayload)
                .then(result => callback(null, { jsonrpc: '2.0', id: methodOrPayload.id, result }))
                .catch(error => callback(error, null));
        } else {
            callback(new Error('Invalid method or payload'), null);
        }
    };

    // Internal methods for event handling
    on = (event, handler) => {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    };

    removeListener = (event, handler) => {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(h => h !== handler);
    };

    emit = (event, data) => {
        if (!this.events[event]) return;
        this.events[event].forEach(handler => handler(data));
    };

    // Utility method to generate a UUID v4
    generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Method to save state to local storage
    saveState = () => {
        const state = {
            accounts: this.accounts,
            currentAccount: this.currentAccount,
            currentChainId: this.currentChainId
        };
        localStorage.setItem('soccoProviderState', JSON.stringify(state));
    };

    // Method to load state from local storage
    loadState = () => {
        const state = JSON.parse(localStorage.getItem('soccoProviderState'));
        if (state) {
            this.accounts = state.accounts;
            this.currentAccount = state.currentAccount;
            this.currentChainId = state.currentChainId;
        }
    };
}

// Export the provider class
export default SoccoProvider;
