import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { sendAnalyticsEvent, TraceEvent, useTrace } from 'analytics'
import {useAccountDrawer, useToggleAccountDrawer} from 'components/AccountDrawer'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import {useCallback, useEffect, useState} from 'react'
import { Plus } from 'react-feather'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'
import { ThemedText } from 'theme/components'

import { ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import { BlueCard, LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import Row, { AutoRow, RowBetween, RowFlat } from '../../components/Row'
import AppBody from '../AppBody'
import { Dots, Wrapper } from '../Pool/styled'
import SwapCurrencyInputPanel from "./SwapCurrencyInputPanel";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {AptosClient, Types} from "aptos";
import {SWAP_ADDRESS, SWAP_ADDRESS2} from "../../constants/aptos";
import {TOKEN_LIST} from "../../constants/tokenList";
import {getAccountCoinValue, getTokenPairMetadata} from "../../apiRequests";
import {calculateRate, formatBalance} from "../../utils/sundry";
import { TokenPairMetadataType } from 'pages/SwapBapt'
import { PoolPriceBar } from './PoolPriceBar'

const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

const AddLiquidityHeaderContainer = styled(AutoColumn)`
  gap: 20px;
  margin-bottom: 16px;
`

const StyledButtonLight = styled(ButtonLight)`
  z-index: 0;
  font-weight: 535;
  border-radius: 16px;
`

export default function AddLiquidity() {
  const navigate = useNavigate()
  const theme = useTheme()
  const trace = useTrace()

  const { pathname } = useLocation()
  const isCreate = pathname.includes('/create')
  const [, toggleAccountDrawer] = useAccountDrawer()

  const [inputToken, setInputToken] = useState(1);
  const [outputToken, setOutputToken] = useState(0);

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

  const createPair = async () => {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${SWAP_ADDRESS2}::router_v2::create_pair`,
      type_arguments: [TOKEN_LIST[inputToken].address, TOKEN_LIST[outputToken].address],
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

  const addLiquidity = async () => {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${SWAP_ADDRESS2}::router_v2::add_liquidity`,
      type_arguments: [TOKEN_LIST[inputToken].address, TOKEN_LIST[outputToken].address],
      arguments: [Number(inputAmount) * 10 ** TOKEN_LIST[inputToken].decimals,
        Number(outputAmount) * 10 ** TOKEN_LIST[outputToken].decimals,
        0,
        0], // 1 is in Octas
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
            setInputBalance(formatBalance(value, TOKEN_LIST[inputToken].decimals));
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
            setOutputBalance(formatBalance(value, TOKEN_LIST[outputToken].decimals));
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
      const output = outputValue.toFixed(2);
      if(Number(output)) setOutputAmount(output);
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
      const input = inputValue.toFixed(2);
      if(Number(input)) setInputAmount(input);
    }
  }, [tokenPairMetadata, inputToken, outputToken]);

  const onInputCurrencySelect = useCallback((currency: Currency) => {
    setInputToken(currency.decimals);
  }, [setInputToken]);

  const onOutputCurrencySelect = useCallback((currency: Currency) => {
    setOutputToken(currency.decimals);
  }, [setOutputToken]);

  const mainButton = () => {
    switch (true) {
      case !connected:
        return <StyledButtonLight onClick={()=>toggleAccountDrawer()}>
          <Trans>Connect wallet</Trans>
        </StyledButtonLight>;
      case !tokenPairMetadata:
        return (<StyledButtonLight onClick={createPair}>
          <Trans>Create pair</Trans>
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
      case (Number(outputAmount) > outputBalance):
        return (<StyledButtonLight onClick={()=>{}} disabled={true}>
          <Trans>Insufficient {TOKEN_LIST[outputToken].symbol} balance</Trans>
        </StyledButtonLight>);
      default:
        return (<StyledButtonLight onClick={addLiquidity}>
          <Trans>Add liquidity</Trans>
        </StyledButtonLight>);
    }
  }

  return (
    <>
      <AppBody>
        <AddRemoveTabs creating={isCreate} adding={true} autoSlippage={DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE} />
        <Wrapper>
          {/*<TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            reviewContent={() => (
              <ConfirmationModalContent
                title={noLiquidity ? <Trans>You are creating a pool</Trans> : <Trans>You will receive</Trans>}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
            currencyToAdd={pair?.liquidityToken}
          />*/}
          <AutoColumn gap="20px">
            {false ||
              (isCreate ? (
                <ColumnCenter>
                  <BlueCard>
                    <AutoColumn gap="10px">
                      <ThemedText.DeprecatedLink fontWeight={535} color="accent1">
                        <Trans>You are the first liquidity provider.</Trans>
                      </ThemedText.DeprecatedLink>
                      <ThemedText.DeprecatedLink fontWeight={485} color="accent1">
                        <Trans>The ratio of tokens you add will set the price of this pool.</Trans>
                      </ThemedText.DeprecatedLink>
                      <ThemedText.DeprecatedLink fontWeight={485} color="accent1">
                        <Trans>Once you are happy with the rate click supply to review.</Trans>
                      </ThemedText.DeprecatedLink>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ) : (
                <ColumnCenter>
                  <BlueCard>
                    <AutoColumn gap="10px">
                      <ThemedText.DeprecatedLink fontWeight={485} color="accent1">
                        <b>
                          <Trans>Tip:</Trans>
                        </b>{' '}
                        <Trans>
                          When you add liquidity, you will receive pool tokens representing your position. These tokens
                          automatically earn fees proportional to your share of the pool, and can be redeemed at any
                          time.
                        </Trans>
                      </ThemedText.DeprecatedLink>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ))}
            <SwapCurrencyInputPanel
                value={inputAmount}
                currency={inputToken}
                onUserInput={onInputAmount}
                onCurrencySelect={onInputCurrencySelect}
                balance={inputBalance}
            />
            <ColumnCenter>
              <Plus size="16" color={theme.neutral2} />
            </ColumnCenter>
            <SwapCurrencyInputPanel
                value={outputAmount}
                currency={outputToken}
                onUserInput={onOutputAmount}
                onCurrencySelect={onOutputCurrencySelect}
                balance={outputBalance}
            />
            {tokenPairMetadata && <>
              <LightCard padding="0px" $borderRadius="20px">
                <RowBetween padding="1rem">
                  <ThemedText.DeprecatedSubHeader fontWeight={535} fontSize={14}>
                    Prices and pool share
                  </ThemedText.DeprecatedSubHeader>
                </RowBetween>{' '}
                <LightCard padding="1rem" $borderRadius="20px">
                  <PoolPriceBar tokenPairMetadata={tokenPairMetadata} inputToken={inputToken} outputToken={outputToken}/>
                </LightCard>
              </LightCard>
            </>}
            {mainButton()}
            {/*{currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
              <>
                <LightCard padding="0px" $borderRadius="20px">
                  <RowBetween padding="1rem">
                    <ThemedText.DeprecatedSubHeader fontWeight={535} fontSize={14}>
                      {noLiquidity ? (
                        <Trans>Initial prices and pool share</Trans>
                      ) : (
                        <Trans>Prices and pool share</Trans>
                      )}
                    </ThemedText.DeprecatedSubHeader>
                  </RowBetween>{' '}
                  <LightCard padding="1rem" $borderRadius="20px">
                    <PoolPriceBar
                      currencies={currencies}
                      poolTokenPercentage={poolTokenPercentage}
                      noLiquidity={noLiquidity}
                      price={price}
                    />
                  </LightCard>
                </LightCard>
              </>
            )}*/}

            {/*{addIsUnsupported ? (
              <ButtonPrimary disabled={true}>
                <ThemedText.DeprecatedMain mb="4px">
                  <Trans>Unsupported asset</Trans>
                </ThemedText.DeprecatedMain>
              </ButtonPrimary>
            ) : !account ? (
              <TraceEvent
                events={[BrowserEvent.onClick]}
                name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
                properties={{ received_swap_quote: false }}
                element={InterfaceElementName.CONNECT_WALLET_BUTTON}
              >
                <ButtonLight onClick={toggleWalletDrawer}>
                  <Trans>Connect wallet</Trans>
                </ButtonLight>
              </TraceEvent>
            ) : (
              <AutoColumn gap="md">
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <RowBetween>
                      {approvalA !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveACallback}
                          disabled={approvalA === ApprovalState.PENDING}
                          width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalA === ApprovalState.PENDING ? (
                            <Dots>
                              <Trans>Approving {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                            </Dots>
                          ) : (
                            <Trans>Approve {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                          )}
                        </ButtonPrimary>
                      )}
                      {approvalB !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveBCallback}
                          disabled={approvalB === ApprovalState.PENDING}
                          width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalB === ApprovalState.PENDING ? (
                            <Dots>
                              <Trans>Approving {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                            </Dots>
                          ) : (
                            <Trans>Approve {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
                <ButtonError
                  onClick={() => {
                    setShowConfirm(true)
                  }}
                  disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                  error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                >
                  <Text fontSize={20} fontWeight={535}>
                    {error ?? <Trans>Supply</Trans>}
                  </Text>
                </ButtonError>
              </AutoColumn>
            )}*/}
          </AutoColumn>
        </Wrapper>
      </AppBody>
      <SwitchLocaleLink />

      {/*{!addIsUnsupported ? (
        pair && !noLiquidity && pairState !== PairState.INVALID ? (
          <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
            <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
          </AutoColumn>
        ) : null
      ) : (
        <UnsupportedCurrencyFooter
          show={addIsUnsupported}
          currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
        />
      )}*/}
    </>
  )
}
