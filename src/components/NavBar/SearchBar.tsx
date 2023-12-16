// eslint-disable-next-line no-restricted-imports
import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { BrowserEvent, InterfaceElementName, InterfaceEventName, InterfaceSectionName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
import { sendAnalyticsEvent, Trace, TraceEvent, useTrace } from 'analytics'
import clsx from 'clsx'
import { Search } from 'components/Icons/Search'
import { useCollectionSearch } from 'graphql/data/nft/CollectionSearch'
import { useSearchTokens } from 'graphql/data/SearchTokens'
import useDebounce from 'hooks/useDebounce'
import { useDisableNFTRoutes } from 'hooks/useDisableNFTRoutes'
import { useIsNftPage } from 'hooks/useIsNftPage'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { organizeSearchResults } from 'lib/utils/searchBar'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { magicalGradientOnHover } from 'nft/css/common.css'
import { useIsMobile, useIsTablet } from 'nft/hooks'
import { useIsNavSearchInputVisible } from 'nft/hooks/useIsNavSearchInputVisible'
import { ChangeEvent, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ApolloError, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import styled from 'styled-components'
import { subheadSmall } from 'nft/css/common.css'

import { ChevronLeftIcon, NavMagnifyingGlassIcon } from '../../nft/components/icons'
import { NavIcon } from './NavIcon'
import * as styles from './SearchBar.css'
import { SearchBarDropdown } from './SearchBarDropdown'
import {useTokenSearch} from "../../hooks/useTokenSearch";

const KeyShortCut = styled.div`
  background-color: ${({ theme }) => theme.surface3};
  color: ${({ theme }) => theme.neutral2};
  padding: 0px 8px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 535;
  line-height: 16px;
  display: flex;
  align-items: center;
  opacity: 0.6;
  backdrop-filter: blur(60px);
`
const query = gql`
query FindCoin($name: String) {
  coin_infos(where: {name: {_like: $name}}, limit: 10) {
    coin_type
    decimals
    name
    symbol
  }
}
`

interface Token {
    coin_type: string
    decimals: number
    name: string
    symbol: string
}

export const SearchBar = () => {
  const [isOpen, toggleOpen] = useReducer((state: boolean) => !state, false)
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { pathname } = useLocation()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isNavSearchInputVisible = useIsNavSearchInputVisible()
  const shouldDisableNFTRoutes = useDisableNFTRoutes()

  useOnClickOutside(searchRef, () => {
    isOpen && toggleOpen()
  })

  /*const { data: collections, loading: collectionsAreLoading } = useCollectionSearch(debouncedSearchValue)

  const { chainId } = useWeb3React()
  const { data: tokens, loading: tokensAreLoading } = useSearchTokens(debouncedSearchValue, chainId ?? 1)

  const isNFTPage = useIsNftPage()

  const [reducedTokens, reducedCollections] = organizeSearchResults(isNFTPage, tokens ?? [], collections ?? [])*/

  /*console.log(debouncedSearchValue);*/
  // const { tokens, loading: tokensAreLoading } = useTokenSearch(debouncedSearchValue);

  const {loading: tokensAreLoading, error, data: tokens} = useQuery(query,{
    variables: { name: `%${searchValue}%` },
  })
  console.log('search value: \n',searchValue)
  console.log('hi\n'+JSON.stringify(tokens))
  /*console.log(tokens);
  console.log(tokensAreLoading);*/

  /*console.log(tokens);
  console.log(reducedTokens);*/

  // close dropdown on escape
  useEffect(() => {
    const escapeKeyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        toggleOpen()
      }
    }

    document.addEventListener('keydown', escapeKeyDownHandler)

    return () => {
      document.removeEventListener('keydown', escapeKeyDownHandler)
    }
  }, [isOpen, toggleOpen])

  // clear searchbar when changing pages
  useEffect(() => {
    setSearchValue('')
  }, [pathname])

  // auto set cursor when searchbar is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const isMobileOrTablet = isMobile || isTablet || !isNavSearchInputVisible

  const trace = useTrace({ section: InterfaceSectionName.NAVBAR_SEARCH })

  const navbarSearchEventProperties = {
    navbar_search_input_text: debouncedSearchValue,
    hasInput: debouncedSearchValue && debouncedSearchValue.length > 0,
    ...trace,
  }

  const { i18n } = useLingui() // subscribe to locale changes
  const placeholderText = isMobileOrTablet
    ? t(i18n)`Search`
    : shouldDisableNFTRoutes
    ? t(i18n)`Search tokens`
    : t(i18n)`Search tokens and pools`

  const handleKeyPress = useCallback(
    (event: any) => {
      if (event.key === '/') {
        event.preventDefault()
        !isOpen && toggleOpen()
      }
    },
    [isOpen]
  )

  useEffect(() => {
    const innerRef = inputRef.current

    if (innerRef !== null) {
      //only mount the listener when input available as ref
      document.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      if (innerRef !== null) {
        document.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [handleKeyPress, inputRef])

  return (
    <Trace section={InterfaceSectionName.NAVBAR_SEARCH}>
      <Column
        data-cy="search-bar"
        position={{ sm: 'fixed', md: 'absolute' }}
        width={{ sm: isOpen ? 'viewWidth' : 'auto', md: 'auto' }}
        ref={searchRef}
        className={clsx(styles.searchBarContainerNft, {
          searchBarContainerDisableBlur: isNavSearchInputVisible,
        })}
        display={{ sm: isOpen ? 'flex' : 'none', xl: 'flex' }}
        {...(isNavSearchInputVisible && {
          position: 'relative',
          display: 'flex',
        })}
        {...(isOpen && {
          boxShadow: 'deep',
        })}
      >
        <Row
          className={clsx(
            styles.nftSearchBar,
            !isOpen && !isMobile && magicalGradientOnHover,
            isMobileOrTablet && (isOpen ? styles.visible : styles.hidden)
          )}
          borderRadius={isOpen || isMobileOrTablet ? undefined : '16'}
          borderTopRightRadius={isOpen && !isMobile ? '16' : undefined}
          borderTopLeftRadius={isOpen && !isMobile ? '16' : undefined}
          borderBottomWidth={isOpen || isMobileOrTablet ? '0px' : '1px'}
          backgroundColor={isOpen ? 'surface1' : 'surface1'}
          onClick={() => !isOpen && toggleOpen()}
          gap="12"
        >
          <Box className={styles.searchContentLeftAlign}>
            <Box display={{ sm: 'none', md: 'flex' }}>
              <Search width="20px" height="20px" />
            </Box>
            <Box display={{ sm: 'flex', md: 'none' }} color="neutral3" onClick={toggleOpen}>
              <ChevronLeftIcon />
            </Box>
          </Box>
          <TraceEvent
            events={[BrowserEvent.onFocus]}
            name={InterfaceEventName.NAVBAR_SEARCH_SELECTED}
            element={InterfaceElementName.NAVBAR_SEARCH_INPUT}
            properties={{ ...trace }}
          >
            <Box
              as="input"
              data-cy="search-bar-input"
              placeholder={placeholderText}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                !isOpen && toggleOpen()
                setSearchValue(event.target.value)
              }}
              onBlur={() => sendAnalyticsEvent(InterfaceEventName.NAVBAR_SEARCH_EXITED, navbarSearchEventProperties)}
              className={`${styles.searchBarInput} ${styles.searchContentLeftAlign}`}
              value={searchValue}
              ref={inputRef}
              width="full"
            />
          </TraceEvent>
          {!isOpen && <KeyShortCut>/</KeyShortCut>}
        </Row>
        <Column overflow="hidden" className={clsx(isOpen ? styles.visible : styles.hidden)}>
          {isOpen && (
            // <SearchBarDropdown
            //   toggleOpen={toggleOpen}
            //   tokens={tokens}
            //   collections={[]}
            //   queryText={debouncedSearchValue}
            //   hasInput={debouncedSearchValue.length > 0}
            //   isLoading={tokensAreLoading}
            // />
            <Column overflow="hidden" className={clsx(styles.searchBarDropdownNft, styles.searchBarScrollable)}>
                <Box opacity={tokensAreLoading ? '0.3' : '1'} transition="125">
                <Row paddingX="16" paddingY="4" gap="8" color="neutral2" className={subheadSmall} style={{ lineHeight: '20px' }}>
                  <Box><Trans>Tokens</Trans></Box>
                </Row>
                  {
                    tokens?.coin_infos.length !== 0 ? 
                    tokens?.coin_infos ? tokens.coin_infos.map((token: Token) => {
                      const { coin_type, decimals, name, symbol} = token as Token;
                      return (
                        <Row className={styles.suggestionRow} key={coin_type}>
                          <Row width="full">
                            <Box className={styles.imageHolder} />
                            <Column gap="4" width="full">
                              <Column className={styles.suggestionPrimaryContainer}>
                                <Box className={styles.primaryText}>{name}</Box>
                              </Column>

                              <Row justifyContent="space-between">
                                <Box className={styles.secondaryText}>{symbol}</Box>
                                <Box borderRadius="round" height="16" width="48" background="surface2" />
                              </Row>
                            </Column>
                          </Row>
                      </Row>
                      )
                    }) : (
                      <Row className={styles.suggestionRow}>
                        <Box><Trans>Loading...</Trans></Box>
                      </Row>
                    )
                    : (
                      <Box className={styles.notFoundContainer}>
                          <Trans>No tokens found.</Trans>
                      </Box>
                    )
                  }
                </Box>
            </Column>
          )}
        </Column>
      </Column>
      {isMobileOrTablet && (
        <NavIcon onClick={toggleOpen} label={placeholderText}>
          <NavMagnifyingGlassIcon />
        </NavIcon>
      )}
    </Trace>
  )
}
