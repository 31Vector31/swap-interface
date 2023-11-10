import {
  isRedirectable,
  useWallet,
  Wallet,
  WalletName,
  WalletReadyState,
} from "@aptos-labs/wallet-adapter-react";
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import {useWeb3React, Web3ReactHooks} from '@web3-react/core'
import { TraceEvent } from 'analytics'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import Loader from 'components/Icons/LoadingSpinner'
import { ActivationStatus, useActivationState } from 'connection/activate'
import {Connection, ConnectionType} from 'connection/types'
import styled from 'styled-components'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'
import {Connector} from "@web3-react/types";
import {ChainId} from "@uniswap/sdk-core";

const OptionCardLeft = styled.div`
  ${flexColumnNoWrap};
  flex-direction: row;
  align-items: center;
`

const OptionCardClickable = styled.button<{ selected: boolean }>`
  align-items: center;
  background-color: unset;
  border: none;
  cursor: pointer;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  justify-content: space-between;
  opacity: ${({ disabled, selected }) => (disabled && !selected ? '0.5' : '1')};
  padding: 18px;
  transition: ${({ theme }) => theme.transition.duration.fast};
`

const HeaderText = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.accent1 : ({ theme }) => theme.neutral1)};
  font-size: 16px;
  font-weight: 535;
  padding: 0 8px;
`
const IconWrapper = styled.div`
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  img {
    ${({ theme }) => !theme.darkMode && `border: 1px solid ${theme.surface3}`};
    border-radius: 12px;
  }
  & > img,
  span {
    height: 40px;
    width: 40px;
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    align-items: flex-end;
  `};
`

const Wrapper = styled.div<{ disabled: boolean }>`
  align-items: stretch;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  width: 100%;

  background-color: ${({ theme }) => theme.surface2};

  &:hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
    background-color: ${({ theme, disabled }) => !disabled && theme.surface3};
  }
  &:focus {
    background-color: ${({ theme, disabled }) => !disabled && theme.surface3};
  }
`

interface OptionProps {
  wallet: Wallet
}
export default function Option({ wallet }: OptionProps) {
  /*const { activationState, tryActivation } = useActivationState()
  const toggleAccountDrawer = useToggleAccountDrawer()
  const { chainId } = useWeb3React()
  const activate = () => tryActivation(connection, toggleAccountDrawer, chainId)

  const isSomeOptionPending = activationState.status === ActivationStatus.PENDING
  const isCurrentOptionPending = isSomeOptionPending && activationState.connection.type === connection.type
  const isDarkMode = useIsDarkMode()*/

  const isSomeOptionPending = false;
  const isCurrentOptionPending = false;

  const { connect, disconnect, account, wallets, connected } = useWallet();

  const {icon, name, readyState, url} = wallet;
  const isWalletReady = readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable;

  const onWalletSelected = (wallet: WalletName) => {
    connect(wallet);
  };

  return (
    <Wrapper disabled={isSomeOptionPending}>
      <TraceEvent
        events={[BrowserEvent.onClick]}
        name={InterfaceEventName.WALLET_SELECTED}
      >
        <OptionCardClickable
          disabled={isSomeOptionPending}
          onClick={isWalletReady ? () => onWalletSelected(wallet.name) : () => window.open(url)}
          selected={isCurrentOptionPending}
        >
          <OptionCardLeft>
            <IconWrapper>
              <img src={icon} alt={name} />
            </IconWrapper>
            <HeaderText>{isWalletReady ? name : `Install ${name}`}</HeaderText>
          </OptionCardLeft>
          {isCurrentOptionPending && <Loader />}
        </OptionCardClickable>
      </TraceEvent>
    </Wrapper>
  )
}
