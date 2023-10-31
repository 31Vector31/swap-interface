import { useState, useCallback } from 'react'
import {RowFixed} from "../../components/Row";
import {Trans} from "@lingui/macro";
import styled from "styled-components";
import {ButtonGray} from "../../components/Button";
import {AutoColumn} from "../../components/Column";
import {TOKEN_LIST, TokenType} from "./tokenList";
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

const CurrencySelect = styled(ButtonGray)<{
    visible: boolean
    selected: boolean
    hideInput?: boolean
    disabled?: boolean
    animateShake?: boolean
}>`
  align-items: center;
  background-color: ${({ selected, theme }) => (selected ? theme.surface1 : theme.accent1)};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  color: ${({ selected, theme }) => (selected ? theme.neutral1 : theme.white)};
  cursor: pointer;
  height: 36px;
  border-radius: 18px;
  outline: none;
  user-select: none;
  border: 1px solid ${({ selected, theme }) => (selected ? theme.surface3 : theme.accent1)};
  font-size: 24px;
  font-weight: 485;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: ${({ selected }) => (selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px')};
  gap: 8px;
  justify-content: space-between;
  margin-left: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  box-shadow: ${({ theme }) => theme.deprecated_shallowShadow};

  &:hover,
  &:active {
    background-color: ${({ theme, selected }) => (selected ? theme.surface2 : theme.accent1)};
  }

  &:before {
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    content: '';
  }

  &:hover:before {
    background-color: ${({ theme }) => theme.deprecated_stateOverlayHover};
  }

  &:active:before {
    background-color: ${({ theme }) => theme.deprecated_stateOverlayPressed};
  }

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};

  @keyframes horizontal-shaking {
    0% {
      transform: translateX(0);
      animation-timing-function: ease-in-out;
    }
    20% {
      transform: translateX(10px);
      animation-timing-function: ease-in-out;
    }
    40% {
      transform: translateX(-10px);
      animation-timing-function: ease-in-out;
    }
    60% {
      transform: translateX(10px);
      animation-timing-function: ease-in-out;
    }
    80% {
      transform: translateX(-10px);
      animation-timing-function: ease-in-out;
    }
    100% {
      transform: translateX(0);
      animation-timing-function: ease-in-out;
    }
  }
  animation: ${({ animateShake }) => (animateShake ? 'horizontal-shaking 300ms' : 'none')};
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 20px;
  font-weight: 535;
`

/*const TokensList = styled(AutoColumn)`
  min-width: 10rem;
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  position: absolute;
  top: 100%;
  margin-top: 10px;
  right: 0;
  z-index: 999;
  color: ${({ theme }) => theme.neutral1};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    min-width: 18.125rem;
  `};
  user-select: none;
  padding: 16px;
`*/

const TokensList = styled.div`
  min-width: 10rem;
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  position: absolute;
  top: -150px;
  margin-top: 10px;
  right: -150px;
  z-index: 999;
  color: ${({ theme }) => theme.neutral1};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    min-width: 18.125rem;
  `};
  user-select: none;
  padding: 0.5rem;
`

const TokensListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  &:hover{
    background-color: ${({ theme }) => theme.surface2};
  }
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;
  margin-left: 8px;
  transform: ${({ selected }) => (selected ? "rotate(180deg)" : "")};

  path {
    /*stroke: ${({ selected, theme }) => (selected ? theme.neutral1 : theme.white)};*/
    stroke: ${({ theme }) => theme.white};
    stroke-width: 2px;
  }
`

const TokenLogo = styled.img`
  border-radius: 50%;
`

interface CurrencySelectButtonProps {
    currency: number
    onCurrencySelect: (value: number) => void
}

export default function CurrencySelectButton({currency, onCurrencySelect}: CurrencySelectButtonProps) {

    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    const toggleDropdown = useCallback(() => {
        setDropdownOpen(prevState => !prevState);
    }, []);

    const selectCurrency = useCallback((index: number) => {
        onCurrencySelect(index);
        setDropdownOpen(false);
    }, []);

    return (
        <div>
            <CurrencySelect
                className="open-currency-select-button"
                visible={true}
                selected={Number.isInteger(currency)}
                onClick={toggleDropdown}
            >
                <Aligner>
                    <RowFixed>
                        <div>
                            <TokenLogo src={TOKEN_LIST[currency].iconSrc} alt={TOKEN_LIST[currency].name} height={24} width={24}/>
                        </div>
                        <StyledTokenName
                            className="token-symbol-container"
                            active={Number.isInteger(currency)}
                        >
                            {TOKEN_LIST[currency].symbol || <Trans>Select token</Trans>}
                        </StyledTokenName>
                    </RowFixed>
                    <StyledDropDown selected={dropdownOpen} />
                </Aligner>
            </CurrencySelect>
            {dropdownOpen &&
                <TokensList>
                    {TOKEN_LIST && TOKEN_LIST.map(
                        ({symbol, iconSrc, name}: TokenType, index) => {
                            return (
                                <TokensListItem key={index} onClick={() => selectCurrency(index)}>
                                    <TokenLogo src={iconSrc} alt={name} width={24} height={24}/>
                                    {symbol}
                                </TokensListItem>
                            );
                        }
                    )}
                </TokensList>}
        </div>
    )
}