class SoccoProvider {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl;
        this.events = {};
        this.ds = ['0x3CDdce06d7A1262393Ff27251654af01753c406D'];
        this.currentAccount = null;
        this.currentChainId = '0x61'; // Default to Mainnet
        this.providerInfo = {
            uuid: this.generateUUID(),
            name: 'rnd',
            icon: 'data:image/png;base64,...', // Ensure this is a valid data URI
            rdns: 'rnd.io'
        };

        // Load state from local storage or initialize default state
        this.loadState();
    }

    async request({ method, params }) {
        switch (method) {
            case 'eth_requestAccounts':
                // Ensure proper async handling
              //  const privateKey = 'd2bb35379df68fd964ea99ea9a2b73e172c527c290074723cc7073f488e7f548'; // Replace with secure key management
               // this.wallet = new ethers.Wallet(privateKey);
                //this.accounts = ['','0x3CDdce06d7A1262393Ff27251654af01753c406D'];
                this.currentAccount = this.ds[0];
                this.emit('accountsChanged', this.ds);
                this.saveState();
                return this.accounts;
            case 'eth_chainId':
                return this.currentChainId;
            case 'eth_getBalance':
                return this.getBalance(params[0]);
            case 'eth_sendTransaction':
                return this.sendTransaction(params[0]);
            default:
                throw new Error('Unsupported method');
        }
    }

    async sendJsonRpcRequest(method, params) {
        const response = await fetch(this.rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method,
                params,
            }),
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        return data.result;
    }

    async connect() {
        console.log("logged in account");
        // For simplicity, we are returning a static account.
        // In a real implementation, you should handle the user's account securely.
        const privateKey = 'd2bb35379df68fd964ea99ea9a2b73e172c527c290074723cc7073f488e7f548'; // Replace with secure key management
        this.wallet = new ethers.Wallet(privateKey);
        this.accounts = [this.wallet.address];
        this.currentAccount = this.accounts[0];
        this.emit('accountsChanged', this.accounts);
        this.saveState();
        return this.accounts;
    }

    async getBalance(account) {
        return this.sendJsonRpcRequest('eth_getBalance', [account, 'latest']);
    }

    async sendTransaction(transaction) {
        // Sign the transaction with the user's private key
        const signedTransaction = await this.wallet.signTransaction(transaction);
        return this.sendJsonRpcRequest('eth_sendRawTransaction', [signedTransaction]);
    }

    on(event, handler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(handler => handler(data));
    }

    // Utility method to generate a UUID v4
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    saveState() {
        const state = {
            accounts: this.accounts,
            currentAccount: this.currentAccount,
            currentChainId: this.currentChainId,
        };
        localStorage.setItem('customProviderState', JSON.stringify(state));
    }

    loadState() {
        const state = JSON.parse(localStorage.getItem('customProviderState'));
        if (state) {
            this.accounts = state.accounts;
            this.currentAccount = state.currentAccount;
            this.currentChainId = state.currentChainId;
        }
    }
}

const provider = new SoccoProvider('https://data-seed-prebsc-1-s1.binance.org:8545');

// Announce provider
function announceProvider() {
    window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
            detail: {
                info: provider.providerInfo,
                provider,
            },
        })
    );
}

// Register provider
function registerProvider() {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.providers = window.ethereum.providers || [];
        window.ethereum.providers.push(provider);

        if (window.ethereum.providerMap instanceof Map) {
            window.ethereum.providerMap.set(provider.providerInfo.name, { info: provider.providerInfo, provider });
        }

        if (window.ethereum.registerProvider) {
            window.ethereum.registerProvider({ info: provider.providerInfo, provider });
        }
    } else {
        window.ethereum = provider;
        window.ethereum.providers = [provider];
        window.ethereum.providerMap = new Map();
        window.ethereum.providerMap.set(provider.providerInfo.name, { info: provider.providerInfo, provider });
    }
}

window.addEventListener('eip6963:requestProvider', event => {
    announceProvider();
});

announceProvider();
registerProvider();