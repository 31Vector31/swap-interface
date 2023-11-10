import {TESTNET_NODE_URL, SWAP_ADDRESS, SWAP_ADDRESS2} from "constants/aptos";

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

export function getAccountTokens(account: string) {
    const body = {
        account,
        currentPage: 1,
        order: "desc",
        orderBy: "balance",
        pageSize: 10,
    };
    return fetch(`https://api.aptools.io/analytics/v1/account_coins`, {body: JSON.stringify(body), ...init, method: "POST"}).then((res) => res.json());
}

export function getTokenImgUrl(name: string = "") {
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

export function getPoolInfo(inputToken: string, outputToken: string) {
    return fetch(`${TESTNET_NODE_URL}/accounts/${SWAP_ADDRESS2}/resource/${SWAP_ADDRESS2}::swap_v2::TokenPairRewardsPool<${outputToken}, ${inputToken}>`).then((res) => res.json());
}

export function getRewardsPoolUserInfo(account: string, inputToken: string, outputToken: string) {
    return  fetch(`${TESTNET_NODE_URL}/accounts/${account}/resource/${SWAP_ADDRESS2}::swap_v2::RewardsPoolUserInfo<${outputToken}, ${inputToken}, ${outputToken}>`).then((res) => res.json());
}