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

export const truncateAddress = (address: string | undefined) => {
    if (!address) return;
    return `${address.slice(0, 6)}...${address.slice(-5)}`;
};

export function calculatePriceImpact(initialTokenAPool: number, initialTokenBPool: number, tokenASwapped: number) {
    const constantProduct = initialTokenAPool * initialTokenBPool;
    const newTokenAPool = initialTokenAPool + tokenASwapped;
    const newTokenBPool = constantProduct / newTokenAPool;

    const tokenBReceived = initialTokenBPool - newTokenBPool;
    const marketPricePerTokenB = initialTokenAPool / initialTokenBPool;
    const pricePaidPerTokenB = tokenASwapped / tokenBReceived;

    const priceImpact = (1 - (marketPricePerTokenB / pricePaidPerTokenB)) * 100;

    return priceImpact.toFixed(3);
}