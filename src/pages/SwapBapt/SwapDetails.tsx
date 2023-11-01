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
import styled from "styled-components";
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
import {useMemo} from "react";
import {TokenPairMetadataType} from "./index";
import {TOKEN_LIST} from "./tokenList";
import {formatBalance, numberWithCommas } from "./swapUtils";

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
    inputAmount: string
    inputToken: number
    outputAmount: string
    outputToken: number
    tokenPairMetadata: TokenPairMetadataType | undefined
    isLastEditInput: boolean
}

export default function SwapDetails({tokenPairMetadata, inputAmount, inputToken, outputAmount, outputToken, isLastEditInput}: SwapDetailsProps) {

    const totalTax = useMemo(() => {
        let totalFee = 0;
        if (tokenPairMetadata) {
            totalFee =
                Number(tokenPairMetadata.liquidity_fee) +
                Number(tokenPairMetadata.rewards_fee) +
                Number(tokenPairMetadata.team_fee);
        }
        return totalFee;
    }, [tokenPairMetadata]);

    const inputTokenReserves = useMemo(() => {
        if(!tokenPairMetadata) return 0;
        let value = numberWithCommas(formatBalance(Number(tokenPairMetadata.balance_x), TOKEN_LIST[inputToken].decimals), TOKEN_LIST[inputToken].decimals);
        return value;
    }, [inputToken, tokenPairMetadata]);

    const outputTokenReserves = useMemo(() => {
        if(!tokenPairMetadata) return 0;
        let value = numberWithCommas(formatBalance(Number(tokenPairMetadata.balance_y), TOKEN_LIST[outputToken].decimals), TOKEN_LIST[outputToken].decimals);
        return value;
    }, [outputToken, tokenPairMetadata]);

    const fee = useMemo(() => {
        let value = ((Number(inputAmount) * 3) / 1000).toLocaleString(undefined, {maximumSignificantDigits: 8});
        return value;
    }, [inputAmount]);

    const taxPercent = useMemo(() => totalTax/100, [totalTax]);

    const taxValue = useMemo(() => {
        let value = ((Number(inputAmount) * totalTax) / 10000).toLocaleString(undefined, {maximumSignificantDigits: 8,});
        return value;
    }, [inputAmount]);

    const receive = useMemo(() => {
        let value = isLastEditInput
            ? (
                Number(outputAmount) -
                (Number(outputAmount) *
                    (totalTax + 30)) /
                10000
            ).toLocaleString(undefined, {
                maximumSignificantDigits:
                TOKEN_LIST[outputToken].decimals,
            })
            : Number(outputAmount).toLocaleString(
                undefined,
                {
                    maximumSignificantDigits:
                    TOKEN_LIST[outputToken].decimals,
                }
            );
        return value;
    }, [outputAmount, totalTax, outputToken, isLastEditInput]);

    return (
        <Wrapper>
            <TraceEvent
                events={[BrowserEvent.onClick]}
                name={SwapEventName.SWAP_DETAILS_EXPANDED}
                element={InterfaceElementName.SWAP_DETAILS_DROPDOWN}
            >
                <StyledHeaderRow
                    data-testid="swap-details-header-row"
                    onClick={() => {}}
                    disabled={false}
                    open={true}
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
                        <div>{inputTokenReserves + " " + TOKEN_LIST[inputToken].symbol}</div>
                    </RowFixed>
                    <RowFixed gap="xs">
                        <div><Link to="/token-pair"><ThemeButton size={ButtonSize.medium} emphasis={ButtonEmphasis.highSoft}>View Pair Info</ThemeButton></Link></div>
                        {/*{!showDetails && isSubmittableTrade(trade) && (
                            <GasEstimateTooltip trade={trade} loading={syncing || loading} />
                        )}
                        <RotatingArrow stroke={trade ? theme.neutral3 : theme.surface2} open={Boolean(trade && showDetails)} />*/}
                    </RowFixed>
                </StyledHeaderRow>
                <StyledHeaderRow data-testid="swap-details-header-row"
                                 onClick={() => {}}
                                 disabled={false}
                                 open={true}>
                    <RowFixed>
                        <div>{outputTokenReserves + " " + TOKEN_LIST[outputToken].symbol}</div>
                    </RowFixed>
                </StyledHeaderRow>
            </TraceEvent>
            <AdvancedSwapDetails fee={fee} taxPercent={taxPercent} taxValue={taxValue} inputToken={inputToken} receive={receive} outputToken={outputToken} isLastEditInput={isLastEditInput}/>
        </Wrapper>
    )
}

interface AdvancedSwapDetailsProps {
    fee: string
    taxPercent: number
    taxValue: string
    inputToken: number
    receive: string
    outputToken: number
    isLastEditInput: boolean
}

function AdvancedSwapDetails({fee, taxPercent, taxValue, inputToken, receive, outputToken, isLastEditInput}: AdvancedSwapDetailsProps) {

    return (
        <AnimatedDropdown open={true}>
            <SwapDetailsWrapper gap="md" data-testid="advanced-swap-details">
                <Separator />
                <SwapLineItem label={"Fee (0.3%)"} value={`${fee} ${TOKEN_LIST[inputToken].symbol}`}/>
                <SwapLineItem label={`Tax (${taxPercent}%)`} value={`${taxValue} ${TOKEN_LIST[inputToken].symbol}`}/>
                <SwapLineItem label={"Slippage %"} value={"Auto"}/>
                <Separator />
                <SwapLineItem label={"You will receive"} value={`${isLastEditInput ? "~" : ""}${receive} ${TOKEN_LIST[outputToken].symbol}`}/>
            </SwapDetailsWrapper>
        </AnimatedDropdown>
    )
}
