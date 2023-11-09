import {Separator, ThemedText} from "../../theme/components";
import {Trans} from "@lingui/macro";
import {TraceEvent} from "../../analytics";
import {formatCommonPropertiesForTrade} from "../../lib/utils/analytics";
import {RowBetween, RowFixed} from "../../components/Row";
import {LoadingOpacityContainer} from "../../components/Loader/styled";
import TradePrice from "../../components/swap/TradePrice";
import {isSubmittableTrade} from "../../state/routing/utils";
import GasEstimateTooltip from "../../components/swap/GasEstimateTooltip";
import {useFormatter} from "../../utils/formatNumbers";
import AnimatedDropdown from "../../components/AnimatedDropdown";
import {ButtonEmphasis, ButtonSize, ThemeButton} from "../../components/Button";
import styled, {useTheme} from "styled-components";
import {ChevronDown} from "react-feather";
import Column from "../../components/Column";
import {Link as NativeLink} from "react-router-dom";
import {
    BrowserEvent,
    InterfaceElementName,
    InterfaceEventName,
    InterfacePageName,
    InterfaceSectionName,
    SharedEventName,
    SwapEventName,
} from '@uniswap/analytics-events'
import SwapLineItem from "./SwapLineItem";
import {useMemo, useState} from "react";
import {RewardsPoolInfoType, RewardsPoolUserInfoType, TokenPairMetadataType} from "./index";
import {formatBalance, numberWithCommas } from "utils/sundry";
import { TOKEN_LIST } from "constants/tokenList";
import {TokenClient} from "aptos";

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  /*cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};*/
`

const RotatingArrow = styled(ChevronDown)<{ open?: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
`

const SwapDetailsWrapper = styled(Column)`
  padding-top: ${({ theme }) => theme.grids.md};
`

const Wrapper = styled(Column)`
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 16px;
  padding: 12px 16px;
`
const Link = styled(NativeLink)`
  text-decoration: none;
`

interface SwapDetailsProps {
    pending: any
    inputToken: number
    poolInfo: RewardsPoolInfoType | undefined
    rewardsPoolInfo: RewardsPoolUserInfoType | undefined
}

export default function SwapDetails({poolInfo, inputToken, rewardsPoolInfo, pending}: SwapDetailsProps) {

    const [showDetails, setShowDetails] = useState(false);
    const theme = useTheme()

    const userStaked = useMemo(() => {
        if(!rewardsPoolInfo) return 0;
        const value = numberWithCommas(formatBalance(Number(rewardsPoolInfo.staked_tokens), TOKEN_LIST[inputToken].decimals));
        return value;
    }, [rewardsPoolInfo, inputToken]);

    const totalStaked = useMemo(() => {
        if(!poolInfo) return 0;
        const value = numberWithCommas(formatBalance(Number(poolInfo.staked_tokens), TOKEN_LIST[inputToken].decimals));
        return value;
    }, [poolInfo, inputToken]);

    return (
        <Wrapper>
            <TraceEvent
                events={[BrowserEvent.onClick]}
                name={SwapEventName.SWAP_DETAILS_EXPANDED}
                element={InterfaceElementName.SWAP_DETAILS_DROPDOWN}
            >
                <StyledHeaderRow
                    data-testid="swap-details-header-row"
                    onClick={() => setShowDetails(!showDetails)}
                    disabled={false}
                    open={showDetails}
                >
                    <RowFixed>
                        {/*{trade ? (
                            <LoadingOpacityContainer $loading={syncing} data-testid="trade-price-container">
                                <TradePrice price={trade.executionPrice} />
                            </LoadingOpacityContainer>
                        ) : loading || syncing ? (
                            <ThemedText.DeprecatedMain fontSize={14}>
                                <Trans>Fetching best price...</Trans>
                            </ThemedText.DeprecatedMain>
                        ) : null}*/}
                        <div>{}</div>
                    </RowFixed>
                    <RowFixed gap="xs">
                        <RotatingArrow stroke={theme.neutral3} open={Boolean(showDetails)}/>
                        {/*{!showDetails && isSubmittableTrade(trade) && (
                            <GasEstimateTooltip trade={trade} loading={syncing || loading} />
                        )}*/}
                    </RowFixed>
                </StyledHeaderRow>
                {/*<StyledHeaderRow data-testid="swap-details-header-row"
                                 onClick={() => setShowDetails(!showDetails)}
                                 disabled={false}
                                 open={showDetails}>
                    <RowFixed>
                        <div>{}</div>
                    </RowFixed>
                    <RowFixed>
                        <RotatingArrow stroke={theme.neutral3} open={Boolean(showDetails)}/>
                    </RowFixed>
                </StyledHeaderRow>*/}
            </TraceEvent>
            <AdvancedSwapDetails open={showDetails} inputToken={inputToken} userStaked={userStaked} totalStaked={totalStaked} pending={pending}/>
        </Wrapper>
    )
}

interface AdvancedSwapDetailsProps {
    inputToken: number
    open: boolean
    userStaked: number | string
    totalStaked: number | string
    pending: any
}

function AdvancedSwapDetails({inputToken, userStaked, totalStaked, pending, open}: AdvancedSwapDetailsProps) {

    return (
        <AnimatedDropdown open={open}>
            <SwapDetailsWrapper gap="md" data-testid="advanced-swap-details">
                <SwapLineItem label={"Your Rewards"} value={`${pending.x || 0}`}/>
                {/*<SwapLineItem label={"Your Rewards"} value={`${pending.y || 0}`}/>*/}
                <SwapLineItem label={"Your stake"} value={`${userStaked} ${TOKEN_LIST[inputToken].symbol}`}/>
                <SwapLineItem label={"Total staked"} value={`${totalStaked} ${TOKEN_LIST[inputToken].symbol}`}/>
                {/*<Separator />
                <SwapLineItem label={"Fee (0.3%)"} value={`${fee} ${TOKEN_LIST[inputToken].symbol}`}/>
                <SwapLineItem label={`Tax (${taxPercent}%)`} value={`${taxValue} ${TOKEN_LIST[inputToken].symbol}`}/>
                <SwapLineItem label={"Slippage %"} value={"Auto"}/>
                <Separator />
                <SwapLineItem label={"You will receive"} value={`${isLastEditInput ? "~" : ""}${receive} ${TOKEN_LIST[outputToken].symbol}`}/>*/}
            </SwapDetailsWrapper>
        </AnimatedDropdown>
    )
}
