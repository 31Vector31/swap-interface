import styled, {useTheme} from "styled-components";
import {flexColumnNoWrap, flexRowNoWrap} from "../../theme/styles";
import {ThemedText} from "../../theme/components";
import {RowBetween, RowFixed} from "../../components/Row";
import {Trans} from "@lingui/macro";
import {ButtonGray} from "../../components/Button";
import {darken} from "polished";
import {Input as NumericalInput} from "../../components/NumericalInput";
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import CurrencySelectButton from "./CurrencySelectButton";
import {ReactNode, useCallback, useState} from "react";
import {LoadingOpacityContainer} from "../../components/Loader/styled";
import {FiatValue} from "../../components/CurrencyInputPanel/FiatValue";
import {NumberType} from "../../utils/formatNumbers";
import {TraceEvent} from "../../analytics";
import {BrowserEvent, InterfaceElementName, SwapEventName} from "@uniswap/analytics-events";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import CurrencySearchModal from "components/SearchModal/CurrencySearchModal";
import {Currency} from "@uniswap/sdk-core";

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${flexColumnNoWrap};
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
`

const FixedContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

const Container = styled.div<{ hideInput?: boolean }>`
  min-height: 44px;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
`

const InputRow = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
`

const LabelRow = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  color: ${({ theme }) => theme.neutral2};
  font-size: 0.75rem;
  line-height: 1rem;

  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.neutral2)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
  min-height: 24px;
  padding: 8px 0px 0px 0px;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;
  margin-left: 8px;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.neutral1 : theme.white)};
    stroke-width: 2px;
  }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 20px;
  font-weight: 535;
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.accent1};
  cursor: pointer;
  font-size: 14px;
  font-weight: 535;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 4px 6px;
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :hover {
    opacity: ${({ disabled }) => (!disabled ? 0.8 : 0.4)};
  }

  :focus {
    outline: none;
  }
`

const StyledNumericalInput = styled(NumericalInput)<{ $loading?: boolean }>`
  text-align: left;
  font-size: 36px;
  font-weight: 485;
  max-height: 44px;
`

interface SwapCurrencyInputPanelProps {
    label: ReactNode
    value: string
    currency: number
    onUserInput: (value: string) => void
    onCurrencySelect: (currency: Currency) => void
    balance: number;
    onMax?: () => void;
    receiveNotSelected?: boolean,
    disableInput?: boolean,
    canMax?: boolean,
    hideMax?: boolean,
}

const SwapCurrencyInputPanel = ({label, value, currency, onUserInput, onCurrencySelect, balance, onMax, receiveNotSelected, disableInput, canMax = true, hideMax = false}: SwapCurrencyInputPanelProps) => {

    const theme = useTheme()
    const {account} = useWallet();
    /*const [modalOpen, setModalOpen] = useState(false)

    const handleDismissSearch = useCallback(() => {
        setModalOpen(false)
    }, [setModalOpen])*/

    const hideBalance = !canMax && receiveNotSelected

    return (
        <InputPanel>
            <Container>
                <ThemedText.SubHeaderSmall style={{ userSelect: 'none' }}>{label}</ThemedText.SubHeaderSmall>
                <InputRow>
                    <div style={{ display: 'flex', flexGrow: '1' }} onClick={()=>{}}>
                        <StyledNumericalInput
                            className="token-amount-input"
                            value={value}
                            onUserInput={onUserInput}
                            disabled={disableInput || receiveNotSelected}
                        />
                    </div>
                    <CurrencySelectButton
                        currency={currency}
                        onCurrencySelect={onCurrencySelect}
                        receiveNotSelected={receiveNotSelected}
                    />
                </InputRow>
                <FiatRow>
                    <RowBetween>
                        {/*<LoadingOpacityContainer $loading={loading}>
                            {fiatValue && <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />}
                        </LoadingOpacityContainer>*/}
                        {/*<FiatValue fiatValue={null} priceImpact={0} />*/}
                        <div></div>
                        {account ? (
                            <RowFixed style={{ height: '16px' }}>
                                {!hideBalance && <ThemedText.DeprecatedBody
                                    data-testid="balance-text"
                                    color={theme.neutral2}
                                    fontWeight={485}
                                    fontSize={14}
                                    style={{ display: 'inline' }}
                                >
                                    Balance:{' '}
                                    {balance}
                                </ThemedText.DeprecatedBody>}
                                <TraceEvent
                                    events={[BrowserEvent.onClick]}
                                    name={SwapEventName.SWAP_MAX_TOKEN_AMOUNT_SELECTED}
                                    element={InterfaceElementName.MAX_TOKEN_AMOUNT_BUTTON}
                                >
                                    {(canMax && !hideMax) && <StyledBalanceMax onClick={onMax}>
                                        <Trans>Max</Trans>
                                    </StyledBalanceMax>}
                                </TraceEvent>
                            </RowFixed>
                        ) : (
                            <span />
                        )}
                    </RowBetween>
                </FiatRow>
            </Container>

            {/*<CurrencySearchModal isOpen={modalOpen} onDismiss={handleDismissSearch} onCurrencySelect={()=>{}}/>*/}

        </InputPanel>
    )
}
export default SwapCurrencyInputPanel