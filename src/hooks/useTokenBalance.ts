import {useEffect, useState} from "react";
import {getAccountCoinValue} from "../apiRequests";
import {formatBalance} from "../utils/sundry";

export function useTokenBalance(account: string, coin: string, decimals: number) {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() =>{
        if(!account || !coin) return;
        setLoading(true);
        getAccountCoinValue(account, coin).then((res: any) => {
            const value = res.data.coin.value;
            if(decimals) setBalance(formatBalance(value, decimals));
            else setBalance(value);
        })
            .finally(() => {setLoading(false)});
    }, [account, coin]);

    return {balance, loading};
}