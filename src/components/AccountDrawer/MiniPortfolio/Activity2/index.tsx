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
import {useAccountSwapTransactions} from "../../../../hooks/useAccountSwapTransactions";
import {EmptyWalletModule} from "../../../../nft/components/profile/view/EmptyWalletContent";

const TokenBalanceText = styled(ThemedText.BodySecondary)`
  ${EllipsisStyle}
`
const TokenNameText = styled(ThemedText.SubHeader)`
  ${EllipsisStyle}
`

const Logo = styled.img`
  border-radius: 50%;
`

const DoubleLogoContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
  position: relative;
  top: 0;
  left: 0;
  img:nth-child(n) {
    width: 19px;
    height: 40px;
    object-fit: cover;
  }
  img:nth-child(1) {
    border-radius: 20px 0 0 20px;
    object-position: 0 0;
  }
  img:nth-child(2) {
    border-radius: 0 20px 20px 0;
    object-position: 100% 0;
  }
`

export default function ActivityTab({ account }: { account: string }) {
    const [drawerOpen, toggleWalletDrawer] = useAccountDrawer();
    const {trasactions, loading} = useAccountSwapTransactions(account);

    if (loading) {
        return <PortfolioSkeleton />
    }

    if (!trasactions || trasactions?.length === 0) {
        return <EmptyWalletModule type="activity" onNavigateClick={toggleWalletDrawer} />;
    }

    return (
        <PortfolioTabWrapper>
            {trasactions.map(
                (trasaction: any, index: any) =>
                    trasaction && <TrasactionRow key={index} trasaction={trasaction} />
            )}
        </PortfolioTabWrapper>
    )
}

function TrasactionRow({trasaction}: { trasaction: any }) {
    const {payload} = trasaction;
    const tokenAddressA = payload.type_arguments[0];
    const tokenAddressB = payload.type_arguments[1];

    const tokenA = useMemo(() => {
        return TOKEN_LIST.find((el: any) => el.address === tokenAddressA);
    }, [tokenAddressA]);

    const tokenB = useMemo(() => {
        return TOKEN_LIST.find((el: any) => el.address === tokenAddressB);
    }, [tokenAddressB]);

    const amountA = useMemo(() => {
        if(!tokenA) return 0;
        return formatBalance(Number(payload.arguments[0]), tokenA.decimals);
    }, [tokenA, payload]);

    const amountB = useMemo(() => {
        if(!tokenB) return 0;
        return formatBalance(Number(payload.arguments[0]), tokenB.decimals);
    }, [tokenB, payload]);

    return (
        <TraceEvent
            events={[BrowserEvent.onClick]}
            name={SharedEventName.ELEMENT_CLICKED}
            element={InterfaceElementName.MINI_PORTFOLIO_TOKEN_ROW}
        >
            <PortfolioRow
                /*left={<PortfolioLogo chainId={currency.chainId} currencies={[currency]} size="40px" />}*/
                left={<DoubleLogoContainer>
                    <Logo src={tokenA?.iconSrc || ""} width={40} height={40} alt={tokenA?.name}/>
                    <Logo src={tokenB?.iconSrc || ""} width={40} height={40} alt={tokenB?.name}/>
                </DoubleLogoContainer>}
                title={<TokenNameText>Swap</TokenNameText>}
                descriptor={`${amountA} ${tokenA?.symbol} -> ${amountB} ${tokenB?.symbol}`}
            />
        </TraceEvent>
    )
}