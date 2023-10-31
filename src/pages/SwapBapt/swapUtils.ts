import {AptosClient} from "aptos";

export const DEVNET_NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1";
export const TESTNET_NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const MAINNET_NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1";
export const SWAP_ADDRESS = "0x90fdf0b1ef78d8dc098e1e7cd3b6fe1f084c808484bc243a1da2a24e7ef06096";

export function getTokenPairMetadata(inputToken: string, outputToken: string) {
    /*const aptosClient = new AptosClient(TESTNET_NODE_URL, {
        WITH_CREDENTIALS: false,
    });*/
    const tokenPairResource = `${SWAP_ADDRESS}::swap::TokenPairMetadata<${inputToken},${outputToken}>`;
    return fetch(`${TESTNET_NODE_URL}/accounts/${SWAP_ADDRESS}/resource/${tokenPairResource}`).then((res) => res.json());
    /*return aptosClient.getAccountResource(SWAP_ADDRESS, tokenPairResource);*/
}

export function getAccountCoinValue(account: string, coin: string) {
    return fetch(`${TESTNET_NODE_URL}/accounts/${account}/resource/0x1::coin::CoinStore<${coin}>`).then((res) => res.json());
}

export const calculateRate = (amount: string, conversionRate: number) => {
    return Number(amount) * conversionRate;
};

export const numberWithCommas = (number: number, decimal?: number) => {
    if (!decimal) decimal = 8; // default number of decimals, 8

    if (number == 0) return 0.0;

    return Number(number.toFixed(decimal)).toLocaleString("en", {
        minimumFractionDigits: decimal,
    });
};

export const formatBalance = (balance: number, decimals: number) => {
    return balance / 10 ** decimals;
};