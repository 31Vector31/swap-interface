import {useEffect, useState} from "react";
import {getAccountStake} from "../apiRequests";

export function useAccountStake(account: string,) {
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() =>{
        if(!account) return;
        setLoading(true);
        getAccountStake(account).then((res: any) => {
            setPools(res);
        })
            .finally(() => {setLoading(false)});
    }, [account]);

    return {pools, loading};
}