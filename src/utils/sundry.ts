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