import {useEffect, useState} from "react";
import {getAccountCoinValue, getAccountTokens} from "../apiRequests";
import {formatBalance} from "../utils/sundry";

export function useAccountTokens(account: string,) {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() =>{
        if(!account) return;
        setLoading(true);
        getAccountTokens(account).then((res: any) => {
            setTokens(res.balance);
        })
            .finally(() => {setLoading(false)});
    }, [account]);

    return {tokens, loading};
}