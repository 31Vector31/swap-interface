import { useState, useEffect, useCallback, useMemo } from 'react'
import {ArrowWrapper, PageWrapper, SwapWrapper} from "../../components/swap/styled";
import {useIsDarkMode} from "../../theme/components/ThemeToggle";
import styled, {useTheme} from "styled-components";
import {useLocation} from "react-router-dom";
import {Trace, TraceEvent} from "../../analytics";
import {NetworkAlert} from "../../components/NetworkAlert/NetworkAlert";
import {SwitchLocaleLink} from "../../components/SwitchLocaleLink";
import SwapHeader from "./SwapHeader";
import SwapCurrencyInputPanel from "./SwapCurrencyInputPanel";
import {AutoColumn} from "../../components/Column";
import {Trans} from "@lingui/macro";
import {ButtonLight} from "../../components/Button";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {AptosClient, Types} from "aptos";
import {TOKEN_LIST} from "./tokenList";
import {
    BrowserEvent,
    InterfaceElementName,
    InterfaceEventName,
    InterfacePageName,
    InterfaceSectionName,
    SharedEventName,
    SwapEventName,
} from '@uniswap/analytics-events'
import {ArrowDown} from "react-feather";
import {ArrowContainer} from "../Swap";
import {getTokenPairMetadata, calculateRate, getAccountCoinValue, SWAP_ADDRESS} from "./swapUtils";
import SwapDetails from './SwapDetails';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";

const SwapBg = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  width: 100vw;
  height: 100vh;
  z-index: -2;
  background: url("/images/ForestBg.webp") no-repeat bottom;
  background-size: contain;
`

const SwapSection = styled.div`
  background-color: ${({ theme }) => theme.surface2};
  border-radius: 16px;
  color: ${({ theme }) => theme.neutral2};
  font-size: 14px;
  font-weight: 500;
  height: 120px;
  line-height: 20px;
  padding: 16px;
  position: relative;

  &:before {
    box-sizing: border-box;
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    border: 1px solid ${({ theme }) => theme.surface2};
  }

  &:hover:before {
    border-color: ${({ theme }) => theme.deprecated_stateOverlayHover};
  }

  &:focus-within:before {
    border-color: ${({ theme }) => theme.deprecated_stateOverlayPressed};
  }
`

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
`

const OutputSwapSection = styled(SwapSection)`
  border-bottom: ${({ theme }) => `1px solid ${theme.surface1}`};
`

export type TokenPairMetadataType = {
    balance_x: string;
    balance_y: string;
    liquidity_fee: string;
    rewards_fee: string;
    team_fee: string;
    team_balance_x?: string;
    team_balance_y?: string;
    treasury_balance_x?: string;
    treasury_balance_y?: string;
    treasury_fee?: string;
    owner?: string;
};

export default function SwapPage({ className }: { className?: string }) {

    const location = useLocation()

    return (
        <Trace>
            <PageWrapper>
                <Swap/>
                <NetworkAlert />
            </PageWrapper>
            {location.pathname === '/swap' && <SwitchLocaleLink />}
        </Trace>
    )
}

const StyledButtonLight = styled(ButtonLight)`
  z-index: 0;
  font-weight: 535;
  border-radius: 16px;
`

export function Swap() {
    const isDark = useIsDarkMode()
    const theme = useTheme()

    const [inputToken, setInputToken] = useState(0);
    const [outputToken, setOutputToken] = useState(3);

    const [inputAmount, setInputAmount] = useState("");
    const [outputAmount, setOutputAmount] = useState("");

    const [inputBalance, setInputBalance] = useState(0);
    const [outputBalance, setOutputBalance] = useState(0);

    const [isInputRegistered, setIsInputRegistered] = useState<boolean>(false);
    const [isOutputRegistered, setIsOutputRegistered] = useState<boolean>(false);

    const [tokenPairMetadata, setTokenPairMetadata] = useState<TokenPairMetadataType>();

    const [isLastEditInput, setIsLastEditInput] = useState<boolean>(true);

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

    const submitAndUpdate = async (payload: Types.TransactionPayload) => {
        try {
            const response = await signAndSubmitTransaction(payload);
            // if you want to wait for transaction
            await aptosClient.waitForTransaction(response?.hash || "");

        } catch (error: any) {
            console.log("error", error);
        }
    };

    const onSignAndSubmitTransaction = async () => {
        if (isLastEditInput) {
            let payload: Types.TransactionPayload = {
                type: "entry_function_payload",
                function: `${SWAP_ADDRESS}::router::swap_exact_input`,
                type_arguments: [TOKEN_LIST[inputToken].address, TOKEN_LIST[outputToken].address],
                arguments:
                    [(Number(inputAmount) * 10 ** TOKEN_LIST[inputToken].decimals).toFixed(0),
                        (Number(outputAmount) * 10 ** TOKEN_LIST[outputToken].decimals * 0.85).toFixed(0)]
            };
            submitAndUpdate(payload);
        }
        else {
            let payload: Types.TransactionPayload = {
                type: "entry_function_payload",
                function: `${SWAP_ADDRESS}::router::swap_exact_output`,
                type_arguments: [TOKEN_LIST[inputToken].address, TOKEN_LIST[outputToken].address],
                arguments: [
                    (Number(outputAmount) * 10 ** TOKEN_LIST[outputToken].decimals).toFixed(0),
                    (Number(inputAmount) * 10 ** TOKEN_LIST[inputToken].decimals * 1.15).toFixed(0),
                ],
            };
            submitAndUpdate(payload);
        }
    };

   /* const onSignAndSubmitTransaction = async () => {
        const faucetClient = new AptosFaucetClient({BASE: "https://faucet.testnet.aptoslabs.com"});
        const amount = 5;
        const address = "0xe7a10a6349ded659e0acdc7be6977cc99814ff085dc19bf76f8b75dbd83dc38b";
        const request: FundRequest = {
            amount,
            address,
        };
        // @ts-ignore
        const response = await faucetClient.fund({ requestBody: request });
        /!*await aptosClient.waitForTransaction(response?.hash || "");*!/
    };*/



    const onRegisterToken = async (isInputToken: boolean) => {
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: "0x1::managed_coin::register",
            type_arguments: [TOKEN_LIST[isInputToken ? inputToken :outputToken].address],
            arguments: [], // 1 is in Octas
        };

        try {
            const response = await signAndSubmitTransaction(payload);
            // if you want to wait for transaction
            await aptosClient.waitForTransaction(response?.hash || "");

            if(isInputToken) setIsInputRegistered(true);
            else setIsOutputRegistered(true);
        } catch (error: any) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        getTokenPairMetadata(TOKEN_LIST[inputToken].address, TOKEN_LIST[outputToken].address).then(res => {
            if(res.data) {
                let data = res.data;
                let metadata: TokenPairMetadataType = {
                    balance_x: data.balance_x.value,
                    balance_y: data.balance_y.value,
                    liquidity_fee: data.liquidity_fee,
                    team_fee: data.team_fee,
                    rewards_fee: data.rewards_fee,
                };
                setTokenPairMetadata(metadata);
            }else {
                getTokenPairMetadata(TOKEN_LIST[outputToken].address, TOKEN_LIST[inputToken].address).then(res => {
                    if(res.data) {
                        let data = res.data;
                        let metadata: TokenPairMetadataType = {
                            balance_x: data.balance_y.value,
                            balance_y: data.balance_x.value,
                            liquidity_fee: data.liquidity_fee,
                            team_fee: data.team_fee,
                            rewards_fee: data.rewards_fee,
                        };
                        setTokenPairMetadata(metadata);
                    }else {
                        setTokenPairMetadata(undefined);
                    }
                });
            }
        });
    }, [inputToken, outputToken]);

    useEffect(() => {
        if (!connected) {
            setInputBalance(0);
            setOutputBalance(0);
        }

        if (connected && account) {
            if (TOKEN_LIST[inputToken].address) {
                getAccountCoinValue(account.address, TOKEN_LIST[inputToken].address).then(res => {
                    if(res.data) {
                        const value = res.data.coin.value;
                        setInputBalance(value);
                        setIsInputRegistered(true);
                    }else {
                        setInputBalance(0);
                        setIsInputRegistered(false);
                    }
                });
            }

            if (TOKEN_LIST[outputToken].address) {
                getAccountCoinValue(account.address, TOKEN_LIST[outputToken].address).then(res => {
                    if(res.data) {
                        const value = res.data.coin.value;
                        setOutputBalance(value);
                        setIsOutputRegistered(true);
                    }else {
                        setOutputBalance(0);
                        setIsOutputRegistered(false);
                    }
                });
            }
        }
    }, [connected, inputToken, outputToken, account]);

    const onInputAmount = useCallback((value: string) => {
        setInputAmount(value);
        setIsLastEditInput(true);
        if(tokenPairMetadata) {
            const outputValue = calculateRate(value,
                (Number(tokenPairMetadata.balance_y) *
                    10 ** TOKEN_LIST[inputToken].decimals) /
                (Number(tokenPairMetadata.balance_x) *
                    10 ** TOKEN_LIST[outputToken].decimals)
            );
            setOutputAmount(outputValue.toFixed(2).toString());
        }
    }, [tokenPairMetadata, inputToken, outputToken]);

    const onOutputAmount = useCallback((value: string) => {
        setOutputAmount(value);
        setIsLastEditInput(false);
        if(tokenPairMetadata) {
            const inputValue = calculateRate(
                value,
                (Number(tokenPairMetadata.balance_x) *
                    10 ** TOKEN_LIST[outputToken].decimals) /
                (Number(tokenPairMetadata.balance_y) *
                    10 ** TOKEN_LIST[inputToken].decimals)
            );
            setInputAmount(inputValue.toFixed(2).toString());
        }
    }, [tokenPairMetadata, inputToken, outputToken]);

    const swapTokens = useCallback(() => {
        let prevInputToken = inputToken;
        let prevOutputToken = outputToken;
        setInputToken(prevOutputToken);
        setOutputToken(prevInputToken);

        let prevInputAmount = inputAmount;
        let prevOutputAmount = outputAmount;
        setInputAmount(prevOutputAmount);
        setOutputAmount(prevInputAmount);

        /*if(isLastEditInput) onOutputAmount(inputAmount);
        else onInputAmount(outputAmount);*/
    }, [inputToken, outputToken, inputAmount, outputAmount]);

    const mainButton = () => {
        switch (true) {
            case !connected:
                return <StyledDiv><WalletSelector/></StyledDiv>;
            case !tokenPairMetadata:
                return (<StyledButtonLight onClick={()=>{}} disabled={true}>
                            <Trans>Non-existent pair</Trans>
                        </StyledButtonLight>);
            case !isInputRegistered:
                return (<StyledButtonLight onClick={()=>onRegisterToken(true)}>
                            <Trans>Register {TOKEN_LIST[inputToken].symbol}</Trans>
                        </StyledButtonLight>);
            case !isOutputRegistered:
                return (<StyledButtonLight onClick={()=>onRegisterToken(false)}>
                            <Trans>Register {TOKEN_LIST[outputToken].symbol}</Trans>
                        </StyledButtonLight>);
            case (Number(inputAmount) > inputBalance):
                return (<StyledButtonLight onClick={()=>{}} disabled={true}>
                            <Trans>Insufficient {TOKEN_LIST[inputToken].symbol} balance</Trans>
                        </StyledButtonLight>);
            default:
                return (<StyledButtonLight onClick={onSignAndSubmitTransaction}>
                            <Trans>Swap</Trans>
                        </StyledButtonLight>);
        }
    }

    return (
        <SwapWrapper isDark={isDark}>
            <SwapBg/>
            <SwapHeader/>
            <div style={{ display: 'relative' }}>
                <SwapSection>
                    <Trace>
                        <SwapCurrencyInputPanel
                            label={<Trans>You pay</Trans>}
                            value={inputAmount}
                            currency={inputToken}
                            onUserInput={onInputAmount}
                            onCurrencySelect={setInputToken}
                            balance={inputBalance}
                        />
                    </Trace>
                </SwapSection>
                <ArrowWrapper clickable={true}>
                    <ArrowContainer
                        data-testid="swap-currency-button"
                        onClick={swapTokens}
                        color={theme.neutral1}
                    >
                        <ArrowDown size="16" color={theme.neutral1}/>
                    </ArrowContainer>
                </ArrowWrapper>
            </div>
            <AutoColumn gap="xs">
                <div>
                    <OutputSwapSection>
                        <Trace>
                            <SwapCurrencyInputPanel
                                label={<Trans>You receive</Trans>}
                                value={outputAmount}
                                currency={outputToken}
                                onUserInput={onOutputAmount}
                                onCurrencySelect={setOutputToken}
                                balance={outputBalance}
                            />
                        </Trace>
                    </OutputSwapSection>
                </div>
                <SwapDetails
                    tokenPairMetadata={tokenPairMetadata}
                    inputAmount={inputAmount}
                    inputToken={inputToken}
                    outputAmount={outputAmount}
                    outputToken={outputToken}
                    isLastEditInput={isLastEditInput}
                />
                <div>
                    {mainButton()}
                </div>
            </AutoColumn>
        </SwapWrapper>
    )
}