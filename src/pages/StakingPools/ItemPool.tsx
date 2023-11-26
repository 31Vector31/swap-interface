import {Trans} from "@lingui/macro";
import {ButtonEmphasis, ButtonLight, ButtonSize, ThemeButton} from "../../components/Button";
import {Input as NumericalInput} from "../../components/NumericalInput";
import {useEffect, useMemo, useState} from "react";
import styled, { css, useTheme } from 'styled-components'
import {TOKEN_LIST} from "../../constants/tokenList";
import {getAccountCoinValue, getPoolInfo, getRewardsPoolUserInfo} from "../../apiRequests";
import {formatBalance, numberWithCommas} from "../../utils/sundry";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {AptosClient, Types} from "aptos";
import {useAccountDrawer} from "../../components/AccountDrawer";
import {RewardsPoolInfoType, RewardsPoolUserInfoType} from "../../components/Stake";
import {SWAP_ADDRESS2} from "../../constants/aptos";

const Container = styled.div`
  border: 1px solid ${({theme}) => theme.surface3};
  border-radius: 12px;
  padding: 16px 20px;
  width: 100%;
`
const Pool = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const Header = styled.div`
  cursor: pointer;
  padding-top: 15px;
  padding-bottom: 15px;
  padding-left: 12px;
  padding-right: 12px;
  
  display: flex;
  align-items: center;
  
  & > div:nth-child(1) {
    flex: 1;
    display: flex;
    justify-content: center;

    color: #9B9B9B;
    min-width: 32px;
    font-size: 14px;
  }

  & > div:nth-child(2) {
    flex: 10;
  }

  & > div:nth-child(3) {
    flex: 1;
  }

  transition: ${({
                   theme: {
                     transition: { duration, timing },
                   },
                 }) => css`background-color ${duration.medium} ${timing.ease}`};
  transition-duration: ${({ theme }) => theme.transition.duration.fast};

  &:hover {
    ${({ theme }) => css`background-color: ${theme.deprecated_hoverDefault};`}
  }
`
const HeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const HeaderTitle = styled.div`
  line-height: 24px;
  font-size: 16px;
`
const InnerContainer = styled.div`
  display: flex;
  gap: 15px;
`
const StyledNumericalInput = styled(NumericalInput)`
  text-align: left;
  width: 100%;
  font-size: 20px;
`
const InputContainer = styled.div`
  background-color: #1B1B1B;
  border-radius: 16px;
  color: #9B9B9B;
  padding: 16px;
  display: flex;
`
const Stake = styled.div`
  display: flex;
  justify-content: space-between;
`
const StyledButtonLight = styled(ButtonLight)`
  border-radius: 16px;
  font-weight: 535;
`
const Rewards = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 7px;
`
const ManageStake = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: 7px;
`
const RewardsBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`
const BlockTitle = styled.div`
  font-size: 20px;
`
const Value = styled.span`
  color: ${({theme}) => theme.neutral2};
`

const Logo = styled.img`
  border-radius: 50%;
`

const Details = styled.div`
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ItemPool = ({pool, index}: any) => {
    const [, toggleAccountDrawer] = useAccountDrawer();
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const revealDetails = () => setShowDetails(!showDetails);

    const [balance, setBalance] = useState(0);
    const [stakeInput, setStakeInput] = useState("");
    const [unstakeInput, setUnstakeInput] = useState("");

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

    useEffect(() => {
        if (!connected) {
            setBalance(0);
        }
        if (connected && account) {
            if (pool.address) {
                getAccountCoinValue(account.address, pool.address).then(res => {
                    if(res.data) {
                        const value = res.data.coin.value;
                        setBalance(formatBalance(value, pool.decimals));
                    }else {
                        setBalance(0);
                    }
                });
            }
        }
    }, [connected, account]);

    useEffect(() => {
        getPoolInfo(pool.address, TOKEN_LIST[1].address).then(res => {
            if(res.data) {
                const data = res.data;
                console.log(data);
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
    }, []);

    useEffect(() => {
        if (connected && account) {
            if (pool.address) {
                getRewardsPoolUserInfo(account.address, pool.address, TOKEN_LIST[1].address).then(res => {
                    if (res.data) {
                        const data = res.data;
                        console.log(data);
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
    }, [account, connected]);

    const userStaked = useMemo(() => {
        if(!rewardsPoolInfo) return 0;
        const value = numberWithCommas(formatBalance(Number(rewardsPoolInfo.staked_tokens), pool.decimals));
        return value;
    }, [rewardsPoolInfo]);

    const totalStaked = useMemo(() => {
        if(!poolInfo) return 0;
        const value = numberWithCommas(formatBalance(Number(poolInfo.staked_tokens), pool.decimals));
        return value;
    }, [poolInfo]);

    const onSignAndSubmitTransaction = async () => {
        const payload: Types.TransactionPayload = {
            type: "entry_function_payload",
            function: `${SWAP_ADDRESS2}::router_v2::stake_tokens_in_pool`,
            type_arguments: [pool.address, TOKEN_LIST[1].address],
            arguments: [Number(stakeInput) * 10 ** pool.decimals], // 1 is in Octas
        };
        try {
            const response = await signAndSubmitTransaction(payload);
            // if you want to wait for transaction
            await aptosClient.waitForTransaction(response?.hash || "");

            /*console.log(response?.hash);*/
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
            function: `${SWAP_ADDRESS2}::router_v2::unstake_tokens_from_pool`,
            type_arguments: [pool.address, TOKEN_LIST[1].address],
            arguments: [Number(unstakeInput) * 10 ** pool.decimals], // 1 is in Octas
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

    const mainStakeButton = () => {
        switch (true) {
            case !connected:
                return <ThemeButton onClick={()=>toggleAccountDrawer()} size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Connect</ThemeButton>;
            case (Number(stakeInput) > balance):
                return <ThemeButton disabled={true} onClick={()=>{}} size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Insufficient</ThemeButton>;
            default:
                return <ThemeButton onClick={onSignAndSubmitTransaction} size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Stake</ThemeButton>;
        }
    }

    const mainUnstakeButton = () => {
        switch (true) {
            case !connected:
                return <ThemeButton onClick={()=>toggleAccountDrawer()} size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Connect</ThemeButton>;
            case (Number(unstakeInput) > userStaked):
                return <ThemeButton disabled={true} onClick={()=>{}} size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Insufficient</ThemeButton>;
            default:
                return <ThemeButton onClick={onWithdrawStake} size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Unstake</ThemeButton>;
        }
    }

    const mainRewardsButton = () => {
        switch (true) {
            case !connected:
                return <StyledButtonLight onClick={()=>toggleAccountDrawer()}>
                    <Trans>Connect wallet</Trans>
                </StyledButtonLight>;
            default:
                return <StyledButtonLight onClick={()=>{}} disabled={true}>
                    <Trans>Collect rewards</Trans>
                </StyledButtonLight>;
        }
    }

    return (
        <Pool>
            <Header onClick={()=>revealDetails()}>
                <div>{index + 1}</div>
                <HeaderMain>
                    <Logo src={pool.img} alt={pool.name} width={32} height={32}/>
                    <HeaderTitle>{pool.name}</HeaderTitle>
                </HeaderMain>
                <div><ThemeButton size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Stake</ThemeButton></div>
            </Header>
            {showDetails &&
                <Details>
                    <InnerContainer>
                        <Rewards>
                            <BlockTitle>Your Rewards</BlockTitle>
                            <RewardsBody>
                                <Value>0 APT</Value>
                                <Value>0 {pool.symbol}</Value>
                            </RewardsBody>
                            {mainRewardsButton()}
                        </Rewards>
                        <ManageStake>
                            <BlockTitle>Manage Stake</BlockTitle>
                            <div>Balance: <Value>{balance} {pool.symbol}</Value></div>
                            <InputContainer>
                                <StyledNumericalInput value={stakeInput} onUserInput={setStakeInput} placeholder={"Ex. 1 " + pool.symbol}/>
                                {mainStakeButton()}
                            </InputContainer>
                            <InputContainer>
                                <StyledNumericalInput value={unstakeInput} onUserInput={setUnstakeInput} placeholder={"Ex. 1 " + pool.symbol}/>
                                {mainUnstakeButton()}
                            </InputContainer>
                        </ManageStake>
                    </InnerContainer>
                    <Stake>
                        <div>Your stake:</div>
                        <Value>{userStaked} {pool.symbol}</Value>
                    </Stake>
                    <Stake>
                        <div>Total staked:</div>
                        <Value>{totalStaked} {pool.symbol}</Value>
                    </Stake>
                </Details>}
        </Pool>
    )
}
export default ItemPool