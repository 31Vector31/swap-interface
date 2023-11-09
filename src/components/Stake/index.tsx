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
/*import {ArrowContainer} from "../Swap";*/
import SwapDetails from './SwapDetails';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import {getAccountCoinValue, getPoolInfo, getRewardsPoolUserInfo, getTokenPairMetadata} from 'apiRequests';
import {TOKEN_LIST} from "../../constants/tokenList";
import {SWAP_ADDRESS, SWAP_ADDRESS2} from "../../constants/aptos";
import {formatBalance, numberWithCommas} from "../../utils/sundry";

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

const StyledButtons = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
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

export default function StakePage({ className }: { className?: string }) {

    const location = useLocation()

    return (
        <Trace>
            <PageWrapper>
                <Stake/>
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

export type RewardsPoolUserInfoType = {
    reward_debt_x: string;
    reward_debt_y: string;
    staked_tokens: string;
    withdrawn_x: string;
    withdrawn_y: string;
};

export type RewardsPoolInfoType = {
    dds_x: string;
    dds_y: string;
    precision_factor: string;
    staked_tokens: string;
};

export const manageStakeSections = ["Stake", "Unstake", "Collect Rewards"];

export function Stake() {
    const isDark = useIsDarkMode()
    const theme = useTheme()

    const [selectedTab, setSelectedTab] = useState(0);
    const [inputToken, setInputToken] = useState(0);
    const [inputAmount, setInputAmount] = useState("");
    const [inputBalance, setInputBalance] = useState(0);

    const [poolInfo, setPoolInfo] = useState<RewardsPoolInfoType>();
    const [rewardsPoolInfo, setRewardsPoolInfo] = useState<RewardsPoolUserInfoType>();

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

    const onSignAndSubmitTransaction = async () => {
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${SWAP_ADDRESS2}::router_v2::stake_tokens_in_pool`,
            type_arguments: ["0xcf8a79dbe461bf84391eadcb8125e2ff3a1b0327259ada782773a7d033a81103::coin::BAPTv2", TOKEN_LIST[1].address],
            /*type_arguments: [TOKEN_LIST[1].address, "0xcf8a79dbe461bf84391eadcb8125e2ff3a1b0327259ada782773a7d033a81103::coin::BAPTv2"],*/
            arguments: [Number(inputAmount) * 10 ** TOKEN_LIST[inputToken].decimals], // 1 is in Octas
        };
        try {
            const response = await signAndSubmitTransaction(payload);
            // if you want to wait for transaction
            await aptosClient.waitForTransaction(response?.hash || "");

            /*console.log(response?.hash);
            updatePoolInfo();
            updateUserStakeInfo();*/
        } catch (error: any) {
            console.log("error", error);
        }
    };

    const onWithdrawStake = async () => {
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${SWAP_ADDRESS2}::router_v2::withdraw_tokens_from_pool`,
            type_arguments: ["0xcf8a79dbe461bf84391eadcb8125e2ff3a1b0327259ada782773a7d033a81103::coin::BAPTv2", TOKEN_LIST[1].address],
            arguments: [Number(inputAmount) * 10 ** 6], // 1 is in Octas
        };
        try {
            const response = await signAndSubmitTransaction(payload);
            // if you want to wait for transaction
            await aptosClient.waitForTransaction(response?.hash || "");

            /*// Update pool info
            updatePoolInfo();

            // Update user stake info
            updateUserStakeInfo();*/
        } catch (error: any) {
            console.log("error", error);
        }
    };

    const claimRewards = async () => {
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${SWAP_ADDRESS2}::router_v2::claim_rewards_from_pool`,
            type_arguments: ["0xcf8a79dbe461bf84391eadcb8125e2ff3a1b0327259ada782773a7d033a81103::coin::BAPTv2", TOKEN_LIST[1].address],
            arguments: [], // 1 is in Octas
        };
        try {
            const response = await signAndSubmitTransaction(payload);
            // if you want to wait for transaction
            await aptosClient.waitForTransaction(response?.hash || "");

           /* // Update pool info
            updatePoolInfo();

            // Update user stake info
            updateUserStakeInfo();*/
        } catch (error: any) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        if (!connected) {
            setInputBalance(0);
        }

        if (connected && account) {
            if (TOKEN_LIST[inputToken].address) {
                getAccountCoinValue(account.address, TOKEN_LIST[inputToken].address).then(res => {
                    if(res.data) {
                        const value = res.data.coin.value;
                        setInputBalance(formatBalance(value, TOKEN_LIST[inputToken].decimals));
                    }else {
                        setInputBalance(0);
                    }
                });
            }
        }
    }, [connected, inputToken, account]);

    useEffect(() => {
        getPoolInfo("0xcf8a79dbe461bf84391eadcb8125e2ff3a1b0327259ada782773a7d033a81103::coin::BAPTv2", TOKEN_LIST[1].address).then(res => {
            if(res.data) {
                const data = res.data;
                const pool_info: RewardsPoolInfoType = {
                    dds_x: data.magnified_dividends_per_share_x,
                    dds_y: data.magnified_dividends_per_share_y,
                    precision_factor: data.precision_factor,
                    staked_tokens: data.staked_tokens,
                };

                setPoolInfo(pool_info);
            }else {
                setPoolInfo(undefined);
            }
        });
    }, [inputToken]);

    useEffect(() => {
        if (connected && account) {
            if (TOKEN_LIST[inputToken].address) {
                getRewardsPoolUserInfo(account.address, "0xcf8a79dbe461bf84391eadcb8125e2ff3a1b0327259ada782773a7d033a81103::coin::BAPTv2", TOKEN_LIST[1].address).then(res => {
                    if (res.data) {
                        const data = res.data;
                        const pool_data: RewardsPoolUserInfoType = {
                            reward_debt_x: data.reward_debt_x,
                            reward_debt_y: data.reward_debt_y,
                            staked_tokens: data.staked_tokens.value,
                            withdrawn_x: data.withdrawn_x,
                            withdrawn_y: data.withdrawn_y,
                        };
                        setRewardsPoolInfo(pool_data);
                    } else {
                        setRewardsPoolInfo(undefined);
                    }
                });
            }
        }
    }, [inputToken, account, connected]);

    const pending = useMemo(() => {
        if(!poolInfo || !rewardsPoolInfo) return {};

        const xValue = Number((
            (Number(rewardsPoolInfo.staked_tokens) * Number(poolInfo.dds_x)) /
            Number(poolInfo.precision_factor) -
            Number(rewardsPoolInfo.reward_debt_x)
        ).toFixed(0));

        const yValue = Number((
            (Number(rewardsPoolInfo.staked_tokens) * Number(poolInfo.dds_y)) /
            Number(poolInfo.precision_factor) -
            Number(rewardsPoolInfo.reward_debt_y)
        ).toFixed(0));

        const x = numberWithCommas(formatBalance(xValue, TOKEN_LIST[1].decimals)) || 0 + " " + TOKEN_LIST[1].symbol;
        const y = numberWithCommas(formatBalance(yValue, TOKEN_LIST[inputToken].decimals)) || 0 + " " + TOKEN_LIST[inputToken].symbol;

        return {x, y};
    }, [poolInfo, rewardsPoolInfo, inputToken]);

    const onInputAmount = useCallback((value: string) => {
        setInputAmount(value);
    }, []);

    const selectTab = useCallback((value: number) => {
        if(value === 2) {
            setInputAmount(pending.y || "0");
        }else setInputAmount("0");
        setSelectedTab(value);
    }, []);

    const mainButton = () => {
        switch (true) {
            case !connected:
                return (<StyledDiv><WalletSelector/></StyledDiv>);
            case selectedTab === 0:
                return (<StyledButtonLight onClick={onSignAndSubmitTransaction}>
                            <Trans>Stake</Trans>
                        </StyledButtonLight>);
            case selectedTab === 1:
                return (<StyledButtonLight onClick={onWithdrawStake}>
                            <Trans>Unstake</Trans>
                        </StyledButtonLight>);
            case selectedTab === 2:
                return (<StyledButtonLight onClick={claimRewards}>
                            <Trans>Collect rewards</Trans>
                        </StyledButtonLight>);
        }
        return (<></>);
    }

    return (
        <SwapWrapper isDark={isDark}>
            <SwapHeader selectedTab={selectedTab} setSelectedTab={selectTab}/>
            <div style={{ display: 'relative' }}>
                <SwapSection>
                    <Trace>
                        <SwapCurrencyInputPanel
                            label={<Trans>{selectedTab === 0 ? "You pay" : "You receive"}</Trans>}
                            value={inputAmount}
                            currency={inputToken}
                            onUserInput={onInputAmount}
                            onCurrencySelect={setInputToken}
                            balance={inputBalance}
                            isNumericalInputDisabled={selectedTab === 2}
                        />
                    </Trace>
                </SwapSection>
            </div>
            <AutoColumn gap="xs">
                <div></div>
                <SwapDetails
                    poolInfo={poolInfo}
                    rewardsPoolInfo={rewardsPoolInfo}
                    inputToken={inputToken}
                    pending={pending}
                />
                <div>
                    {mainButton()}
                </div>
            </AutoColumn>
        </SwapWrapper>
    )
}