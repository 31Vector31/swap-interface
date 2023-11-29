import PortfolioRow, { PortfolioSkeleton, PortfolioTabWrapper } from '../PortfolioRow'
import {useAccountStake} from "../../../../hooks/useAccountStake";
import {TraceEvent} from "../../../../analytics";
import { BrowserEvent, InterfaceElementName, SharedEventName } from '@uniswap/analytics-events'
import {getTokenImgUrl} from "../../../../apiRequests";
import {NumberType} from "../../../../utils/formatNumbers";
import { EllipsisStyle, ThemedText } from 'theme/components'
import styled from "styled-components";
import {formatBalance} from "../../../../utils/sundry";
import {TOKEN_LIST} from "../../../../constants/tokenList";
import {useNavigate} from "react-router-dom";
import {useAccountDrawer} from "../../index";
import {useCallback, useMemo} from "react";

const TokenBalanceText = styled(ThemedText.BodySecondary)`
  ${EllipsisStyle}
`
const TokenNameText = styled(ThemedText.SubHeader)`
  ${EllipsisStyle}
`

const Logo = styled.img`
  border-radius: 50%;
`

export default function Stake({ account }: { account: string }) {
    const {pools, loading} = useAccountStake(account);
    if (loading) {
        return <PortfolioSkeleton />
    }

    return (
        <PortfolioTabWrapper>
            {pools.map(
                (pool: any, index: any) =>
                    pool && <PoolRow key={index} pool={pool} />
            )}
        </PortfolioTabWrapper>
    )
}

const pattern = /::([A-Za-z0-9]+)>/g;

function PoolRow({pool}: { pool: any }) {
    const [, toggleAccountDrawer] = useAccountDrawer()
    const navigate = useNavigate()
    const stakedTokens = pool.data.staked_tokens.value;
    const {type} = pool;

    const name = useMemo(() => {
        return [...type.matchAll(pattern)][0][1];
    }, [type]);

    const token = useMemo(() => {
        return TOKEN_LIST.find(el => el.name === name);
    }, [name]);

    const onClick = useCallback( () => {
        toggleAccountDrawer();
        navigate('/staking-pools');
    }, [navigate, toggleAccountDrawer])

    return (
        <TraceEvent
            events={[BrowserEvent.onClick]}
            name={SharedEventName.ELEMENT_CLICKED}
            element={InterfaceElementName.MINI_PORTFOLIO_TOKEN_ROW}
        >
            <PortfolioRow
                /*left={<PortfolioLogo chainId={currency.chainId} currencies={[currency]} size="40px" />}*/
                left={<Logo src={token?.iconSrc || ""} width={40} height={40} alt={name}/>}
                title={<TokenNameText>{name}</TokenNameText>}
                descriptor={token &&
                    <TokenBalanceText>
                        {formatBalance(Number(stakedTokens), token.decimals)} {name}
                    </TokenBalanceText>
                }
                onClick={onClick}
            />
        </TraceEvent>
    )
}