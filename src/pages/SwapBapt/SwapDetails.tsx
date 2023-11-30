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
import {useEffect, useMemo, useState} from "react";
import {TokenPairMetadataType} from "./index";
import {calculatePriceImpact, formatBalance, numberWithCommas} from "utils/sundry";
import {TOKEN_LIST} from "../../constants/tokenList";
import {getAccountCoinValue, getProtocolFee, getTokenFee} from "../../apiRequests";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {AptosAccount, AptosClient, BCS, HexString, TxnBuilderTypes, Types} from "aptos";
import {SWAP_ADDRESS2} from "../../constants/aptos";

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
    const [showDetails, setShowDetails] = useState(false);
    const theme = useTheme()

    const {
        connect,
        account,
        network,
        connected,
        disconnect,
        wallet,
        wallets,
        signAndSubmitTransaction,
        signTransaction,
        signMessage,
        signMessageAndVerify,
    } = useWallet();

    const aptosClient = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1", {
        WITH_CREDENTIALS: false,
    });

    const [protocolFee, setProtocolFee] = useState(0);
    const [networkCost, setNetworkCost] = useState("0");

    const [inputFee, setInputFee] = useState(0);
    const [outputFee, setOutputFee] = useState(0);

    const simulateTransaction = async () => {
        if(!account) return;
        const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
            new TxnBuilderTypes.EntryFunction(
                TxnBuilderTypes.ModuleId.fromStr(`${SWAP_ADDRESS2}::router_v2`),
                new TxnBuilderTypes.Identifier("swap_exact_input"),
                [new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString(TOKEN_LIST[inputToken].address)),
                    new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString(TOKEN_LIST[outputToken].address))],
                [BCS.bcsSerializeUint64(Number((Number(inputAmount) * 10 ** TOKEN_LIST[inputToken].decimals).toFixed(0))),
                    BCS.bcsSerializeUint64(Number((Number(outputAmount) * 0.1 * 10 ** TOKEN_LIST[outputToken].decimals).toFixed(0)))]
            ),
        );
        const accountAddress = new HexString(account?.address || "");
        const raw = await aptosClient.generateRawTransaction(accountAddress, payload);
        // @ts-ignore
        const transaction = await aptosClient.simulateTransaction(new TxnBuilderTypes.Ed25519PublicKey(HexString.ensure(account.publicKey || "").toUint8Array()), raw);
        setNetworkCost(transaction[0].gas_used);
    };

    useEffect(() => {
        if(connected && account && inputAmount && outputAmount) simulateTransaction();
    }, [isLastEditInput, inputToken, outputToken, outputAmount, inputAmount, account, connected]);

    useEffect(() => {
        getProtocolFee().then(res => {
           setProtocolFee(res);
        });
    }, []);

    useEffect(() => {
        getTokenFee(TOKEN_LIST[inputToken].address).then(res => {
            if(Number(res)) setInputFee(res);
            else setInputFee(0);
        })
    }, [inputToken]);

    useEffect(() => {
        getTokenFee(TOKEN_LIST[outputToken].address).then(res => {
            if(Number(res)) setOutputFee(res);
            else setOutputFee(0);
        });
    }, [outputToken]);

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

    const priceImpact = useMemo(() => {
        if(!tokenPairMetadata || !Number(inputAmount)) return "0";
        const inputBalance = formatBalance(Number(tokenPairMetadata.balance_x), TOKEN_LIST[inputToken].decimals);
        const outputBalance = formatBalance(Number(tokenPairMetadata.balance_y), TOKEN_LIST[outputToken].decimals);
        return calculatePriceImpact(inputBalance, outputBalance, Number(inputAmount));
    }, [inputToken, tokenPairMetadata, outputToken, inputAmount]);

    const fee = useMemo(() => {
        let value = (Number(inputAmount) * protocolFee).toLocaleString(undefined, {maximumSignificantDigits: 8});
        return value;
    }, [inputAmount, protocolFee]);

    const feePercent = useMemo(() => {
        let value = parseFloat((protocolFee * 100).toFixed(2));
        return value;
    }, [protocolFee]);

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
                    (totalTax + 90)) /
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
                        <div>{inputTokenReserves + " " + TOKEN_LIST[inputToken].symbol}</div>
                    </RowFixed>
                    <RowFixed gap="xs">
                        <RotatingArrow stroke={theme.neutral3} open={Boolean(showDetails)}/>
                        {/*<div><Link to="/token-pair"><ThemeButton size={ButtonSize.medium} emphasis={ButtonEmphasis.highSoft}>View Pair Info</ThemeButton></Link></div>*/}
                        {/*{!showDetails && isSubmittableTrade(trade) && (
                            <GasEstimateTooltip trade={trade} loading={syncing || loading} />
                        )}*/}
                    </RowFixed>
                </StyledHeaderRow>
                <StyledHeaderRow data-testid="swap-details-header-row"
                                 onClick={() => setShowDetails(!showDetails)}
                                 disabled={false}
                                 open={showDetails}>
                    <RowFixed>
                        <div>{outputTokenReserves + " " + TOKEN_LIST[outputToken].symbol}</div>
                    </RowFixed>
                </StyledHeaderRow>
            </TraceEvent>
            <AdvancedSwapDetails inputFee={inputFee} outputFee={outputFee} networkCost={networkCost} priceImpact={priceImpact} protocolFeePercent={feePercent} open={showDetails} fee={fee} taxPercent={taxPercent} taxValue={taxValue} inputToken={inputToken} receive={receive} outputToken={outputToken} isLastEditInput={isLastEditInput}/>
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
    open: boolean
    protocolFeePercent: number
    priceImpact: string
    networkCost: string
    inputFee: number
    outputFee: number
}

function AdvancedSwapDetails({inputFee, outputFee, networkCost, priceImpact, fee, taxPercent, taxValue, inputToken, receive, outputToken, isLastEditInput, open, protocolFeePercent}: AdvancedSwapDetailsProps) {

    return (
        <AnimatedDropdown open={open}>
            <SwapDetailsWrapper gap="md" data-testid="advanced-swap-details">
                <Separator />
                <SwapLineItem label={"Price Impact"} value={`${priceImpact}%`}/>
                <SwapLineItem label={"Max. slippage"} value={"0.5% (Auto)"}/>
                <SwapLineItem label={"Token X Fee"} value={`${inputFee}%`}/>
                <SwapLineItem label={"Token Y Fee"} value={`${outputFee}%`}/>
                <SwapLineItem label={`Fee (${protocolFeePercent}%)`} value={`${fee} ${TOKEN_LIST[inputToken].symbol}`}/>
                <SwapLineItem label={"Network Cost"} value={`${networkCost} Gas Units`}/>
                {/*<SwapLineItem label={`Tax (${taxPercent}%)`} value={`${taxValue} ${TOKEN_LIST[inputToken].symbol}`}/>*/}
                <Separator />
                <SwapLineItem label={"You will receive"} value={`${isLastEditInput ? "~" : ""}${receive} ${TOKEN_LIST[outputToken].symbol}`}/>
            </SwapDetailsWrapper>
        </AnimatedDropdown>
    )
}
