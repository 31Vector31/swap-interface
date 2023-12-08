import {TESTNET_NODE_URL, SWAP_ADDRESS, SWAP_ADDRESS2, denominator} from "constants/aptos";

export const apiAptools = "https://api.aptools.io";

const initAptoolsApi = {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer iiskLM6WrAI@lkwQwIWuD*RWIQOhqdpkiisk*M6WrAIAlk@QwIWuDTRWIQOhqdpk"
    },
};

const initAptosApi = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    },
};

export function getTokensStatistics() {
    return fetch(`https://api.aptools.io/analytics/v1/tokens_statistics`, initAptoolsApi).then((res) => res.json());
}

export function getAccountTokens(account: string) {
    const body = {
        account,
        currentPage: 1,
        order: "desc",
        orderBy: "balance",
        pageSize: 10,
    };
    return fetch(`https://api.aptools.io/analytics/v1/account_coins`, {body: JSON.stringify(body), ...initAptoolsApi, method: "POST"}).then((res) => res.json());
}

export function getTokenImgUrl(name: string = "") {
    return apiAptools + `/images/${name.toLowerCase().replace(/ /g, '-')}.png`;
}

export function getTokenPairMetadata(inputToken: string, outputToken: string) {
    /*const aptosClient = new AptosClient(TESTNET_NODE_URL, {
        WITH_CREDENTIALS: false,
    });*/
    const tokenPairResource = `${SWAP_ADDRESS2}::swap_v2::TokenPairMetadata<${inputToken},${outputToken}>`;
    return fetch(`${TESTNET_NODE_URL}/accounts/${SWAP_ADDRESS2}/resource/${tokenPairResource}`).then((res) => res.json());
    /*return aptosClient.getAccountResource(SWAP_ADDRESS, tokenPairResource);*/
}

export function getAccountCoinValue(account: string, coin: string) {
    return fetch(`${TESTNET_NODE_URL}/accounts/${account}/resource/0x1::coin::CoinStore<${coin}>`).then((res) => res.json());
}

export function getPoolInfo(inputToken: string, outputToken: string) {
    return fetch(`${TESTNET_NODE_URL}/accounts/${SWAP_ADDRESS2}/resource/${SWAP_ADDRESS2}::swap_v2::TokenPairRewardsPool<${outputToken}, ${inputToken}>`).then((res) => res.json());
}

export function getRewardsPoolUserInfo(account: string, inputToken: string, outputToken: string) {
    return fetch(`${TESTNET_NODE_URL}/accounts/${account}/resource/${SWAP_ADDRESS2}::swap_v2::RewardsPoolUserInfo<${outputToken}, ${inputToken}, ${inputToken}>`).then((res) => res.json());
}

export function getDexLiquidityFee() {
    const body = {
        "function": SWAP_ADDRESS2 + "::swap_v2::get_dex_liquidity_fee",
        "type_arguments": [],
        "arguments": []
    };
    return fetch(`${TESTNET_NODE_URL}/view`, {body: JSON.stringify(body), ...initAptosApi}).then((res) => res.json());
}

export function getDexTreasuryFee() {
    const body = {
        "function": SWAP_ADDRESS2 + "::swap_v2::get_dex_treasury_fee",
        "type_arguments": [],
        "arguments": []
    };
    return fetch(`${TESTNET_NODE_URL}/view`, {body: JSON.stringify(body), ...initAptosApi}).then((res) => res.json());
}

export async function getProtocolFee() {
    const body = {
        "function": SWAP_ADDRESS2 + "::admin::get_dex_fees",
        "type_arguments": [],
        "arguments": []
    };
    const fee = await fetch(`${TESTNET_NODE_URL}/view`, {body: JSON.stringify(body), ...initAptosApi}).then((res) => res.json());
    return Number(fee[0]) / denominator;
    /*const dexLiquidityFee = await getDexLiquidityFee();
    const dexTreasuryFee = await getDexTreasuryFee();
    return (Number(dexLiquidityFee[0]) + Number(dexTreasuryFee[0])) / denominator;*/
}

export async function getTokenFee(token: string) {
    const body = {
        "function": SWAP_ADDRESS2 + "::fee_on_transfer::get_total_fee_on_transfer",
        "type_arguments": [token],
        "arguments": []
    };
    const fee = await fetch(`${TESTNET_NODE_URL}/view`, {body: JSON.stringify(body), ...initAptosApi}).then((res) => res.json());
    return Number(fee[0]) / denominator;
    /*const dexLiquidityFee = await getDexLiquidityFee();
    const dexTreasuryFee = await getDexTreasuryFee();
    return (Number(dexLiquidityFee[0]) + Number(dexTreasuryFee[0])) / denominator;*/
}

export function getAccountResources(account: string, limit: number = 20) {
    return fetch(`${TESTNET_NODE_URL}/accounts/${account}/resources?limit=${limit}`).then((res) => res.json());
}

export function getAccountTransactions(account: string, limit: number = 20) {
    return fetch(`${TESTNET_NODE_URL}/accounts/${account}/transactions?limit=${limit}`).then((res) => res.json());
}


export async function getAccountStake(account: string) {
    const resources = await getAccountResources(account, 500);
    const rewardsPoolUserInfo = resources.filter((resource: any) => resource.type.includes(`${SWAP_ADDRESS2}::swap_v2::RewardsPoolUserInfo`));
    return rewardsPoolUserInfo;
}