import {useEffect, useState} from "react";
import {getAccountTransactions} from "../apiRequests";
import {SWAP_ADDRESS2} from "../constants/aptos";

export function useAccountSwapTransactions(account: string,) {
    const [trasactions, setTrasactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() =>{
        if(!account) return;
        setLoading(true);
        getAccountTransactions(account, 500).then((res: any) => {
            const swapTransactions = res.filter((el: any) => el.payload.function.includes(`${SWAP_ADDRESS2}::router_v2::swap_exact`));
            setTrasactions(swapTransactions);
        })
            .finally(() => {setLoading(false)});
    }, [account]);

    return {trasactions, loading};
}