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
import {getTokenPairMetadata, calculateRate, getAccountCoinValue} from "./swapUtils";
import SwapDetails from './SwapDetails';

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

const SwapButton = styled(ButtonLight)`
  z-index: 0;
`

export function Swap() {
    const isDark = useIsDarkMode()
    const theme = useTheme()

    const [inputToken, setInputToken] = useState(0);
    const [outputToken, setOutputToken] = useState(3);
    const [inputAmount, setInputAmount] = useState("");
    const [outputAmount, setOutputAmount] = useState("");

    const [tokenPairMetadata, setTokenPairMetadata] = useState<TokenPairMetadataType>();

    const [inputBalance, setInputBalance] = useState(0);
    const [outputBalance, setOutputBalance] = useState(0);

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
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${"0x90fdf0b1ef78d8dc098e1e7cd3b6fe1f084c808484bc243a1da2a24e7ef06096"}::router::swap_exact_input`,
            type_arguments: [TOKEN_LIST[inputToken].address, TOKEN_LIST[outputToken].address],
            arguments:
                [(Number(inputAmount) * 10 ** TOKEN_LIST[inputToken].decimals).toFixed(0),
                    (Number(outputAmount) * 10 ** TOKEN_LIST[outputToken].decimals * 0.97).toFixed(0)]
        };
        /*const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${"0x90fdf0b1ef78d8dc098e1e7cd3b6fe1f084c808484bc243a1da2a24e7ef06096"}::router::swap_exact_input`,
            type_arguments: ["0x97c8aca6082f2ef7a0046c72eb81ebf203ca23086baf15557579570c86a89fd3::test_coins::TestUSDT", "0x97c8aca6082f2ef7a0046c72eb81ebf203ca23086baf15557579570c86a89fd3::test_coins::TestBAPT"],
            arguments: [100000000, 10051897
                /!*(Number(1) * 10 ** 6).toFixed(0),
                (Number(6) * 10 ** 6 * 0.85).toFixed(0),*!/
            ],
        };*/

        /*const payload: Types.TransactionPayload = {
          type: "entry_function_payload",
          function: `${"0x90fdf0b1ef78d8dc098e1e7cd3b6fe1f084c808484bc243a1da2a24e7ef06096"}::router::create_rewards_pool`,
          type_arguments: ["0x97c8aca6082f2ef7a0046c72eb81ebf203ca23086baf15557579570c86a89fd3::test_coins::TestUSDT", "0x97c8aca6082f2ef7a0046c72eb81ebf203ca23086baf15557579570c86a89fd3::test_coins::TestBAPT"],
          arguments: [true],
        };*/



        submitAndUpdate(payload);
    };

    useEffect(() => {
        getTokenPairMetadata(TOKEN_LIST[inputToken].address, TOKEN_LIST[outputToken].address).then(res => {
            let data = res.data;
            let metadata: TokenPairMetadataType = {
                balance_x: data.balance_x.value,
                balance_y: data.balance_y.value,
                liquidity_fee: data.liquidity_fee,
                team_fee: data.team_fee,
                rewards_fee: data.rewards_fee,
            };
            setTokenPairMetadata(metadata);
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
                    const value = res.data.coin.value;
                    setInputBalance(value);
                });
            }

            if (TOKEN_LIST[outputToken].address) {
                getAccountCoinValue(account.address, TOKEN_LIST[outputToken].address).then(res => {
                    const value = res.data.coin.value;
                    setOutputBalance(value);
                });
            }
        }
    }, [connected, inputToken, outputToken, account]);

    const onInputAmount = useCallback((value: string) => {
        setInputAmount(value);
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
                    <TraceEvent
                        events={[BrowserEvent.onClick]}
                        name={SwapEventName.SWAP_TOKENS_REVERSED}
                        element={InterfaceElementName.SWAP_TOKENS_REVERSE_ARROW_BUTTON}
                    >
                        <ArrowContainer
                            data-testid="swap-currency-button"
                            onClick={() => {}}
                            color={theme.neutral1}
                        >
                            <ArrowDown size="16" color={theme.neutral1} />
                        </ArrowContainer>
                    </TraceEvent>
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
                />
                <div>
                    <SwapButton onClick={onSignAndSubmitTransaction} fontWeight={535} $borderRadius="16px">
                        <Trans>Swap</Trans>
                    </SwapButton>
                </div>
            </AutoColumn>
        </SwapWrapper>
    )
}