import { TESTNET_NODE_URL, SWAP_ADDRESS } from "constants/aptos";

export const apiAptools = "https://api.aptools.io";

const init = {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer "
    },
};

export function getTokensStatistics() {
    return fetch(`https://api.aptools.io/analytics/v1/tokens_statistics`, init).then((res) => res.json());
}

export function getTokenImgUrl(name: string) {
    return apiAptools + `/images/${name.toLowerCase().replace(/ /g, '-')}.png`;
}

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