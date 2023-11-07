import {useEffect, useMemo, useState} from "react";
import {getTokensStatistics} from "../apiRequests";

/*
export function useTokenSearch(query: string) {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getTokensStatistics().then((res: any) => {
            setTokens(res.top_tokens_by_volume);
        })
        .finally(() => {setLoading(false)});
    }, []);

    return {tokens, loading};
}*/

export function useTokenSearch(query: string) {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);

    const search = useMemo(() => query ? query.trim().toLowerCase() : "", [query]);

    useEffect(() => {
        if(search === "") {
            setTokens([]);
            return;
        }
        setLoading(true);
        getTokensStatistics().then((res: any) => {
            const data = res.top_tokens_by_volume;
            const filteredData = data.filter((token: any) => token.token.toLowerCase().includes(search));
            const results = filteredData.slice(0, 5).map((token: any) => {
                return {
                    "__typename": "Token",
                    "id": "VG9rZW46RVRIRVJFVU1fMHhkYWMxN2Y5NThkMmVlNTIzYTIyMDYyMDY5OTQ1OTdjMTNkODMxZWM3",
                    "decimals": 6,
                    "name": token.token,
                    "chain": "ETHEREUM",
                    "standard": "ERC20",
                    "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
                    "symbol": "",
                    "market": {
                        "__typename": "TokenMarket",
                        "id": "VG9rZW5NYXJrZXQ6RVRIRVJFVU1fMHhkYWMxN2Y5NThkMmVlNTIzYTIyMDYyMDY5OTQ1OTdjMTNkODMxZWM3X1VTRA==",
                        "price": {
                            "__typename": "Amount",
                            "id": "QW1vdW50OjFfVVNE",
                            "value": token.volume_24h,
                            "currency": "USD"
                        },
                        "pricePercentChange": {
                            "__typename": "Amount",
                            "id": "QW1vdW50OjIuMjIwNDQ2MDQ5MjUwMzEzZS0xNF9VU0Q=",
                            "value": token.change
                        },
                        "volume24H": {
                            "__typename": "Amount",
                            "id": "QW1vdW50OjE2Mzk3MzMzMy45MDgxMDM5NF9VU0Q=",
                            "value": token.volume_24h,
                            "currency": "USD"
                        }
                    },
                    "project": {
                        "__typename": "TokenProject",
                        "id": "VG9rZW5Qcm9qZWN0OkVUSEVSRVVNXzB4ZGFjMTdmOTU4ZDJlZTUyM2EyMjA2MjA2OTk0NTk3YzEzZDgzMWVjN19UZXRoZXI=",
                        "logoUrl": "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
                        "safetyLevel": "VERIFIED"
                    }
                };
            });
            setTokens(results);
        })
            .finally(() => {setLoading(false)});
    }, [search]);

    return {tokens, loading};
}