import { Trans } from '@lingui/macro'
import { InterfacePageName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
import { Trace } from 'analytics'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { AboutSection } from 'components/Tokens/TokenDetails/About'
import AddressSection from 'components/Tokens/TokenDetails/AddressSection'
import BalanceSummary from 'components/Tokens/TokenDetails/BalanceSummary'
import { BreadcrumbNavLink } from 'components/Tokens/TokenDetails/BreadcrumbNavLink'
import ChartSection from 'components/Tokens/TokenDetails/ChartSection'
import MobileBalanceSummaryFooter from 'components/Tokens/TokenDetails/MobileBalanceSummaryFooter'
import ShareButton from 'components/Tokens/TokenDetails/ShareButton'
import TokenDetailsSkeleton, {
  Hr,
  LeftPanel,
  RightPanel,
  TokenDetailsLayout,
  TokenInfoContainer,
  TokenNameCell,
} from 'components/Tokens/TokenDetails/Skeleton'
import StatsSection from 'components/Tokens/TokenDetails/StatsSection'
import TokenSafetyMessage from 'components/TokenSafety/TokenSafetyMessage'
import TokenSafetyModal from 'components/TokenSafety/TokenSafetyModal'
import { NATIVE_CHAIN_ID, nativeOnChain } from 'constants/tokens'
import { checkWarning } from 'constants/tokenSafety'
import { TokenPriceQuery } from 'graphql/data/__generated__/types-and-hooks'
import { Chain, TokenQuery, TokenQueryData } from 'graphql/data/Token'
import { QueryToken } from 'graphql/data/Token'
import { getTokenDetailsURL, InterfaceGqlChain, supportedChainIdFromGQLChain } from 'graphql/data/util'
import { useOnGlobalChainSwitch } from 'hooks/useGlobalChainSwitch'
import { UNKNOWN_TOKEN_SYMBOL, useTokenFromActiveNetwork } from 'lib/hooks/useCurrency'
import { Swap } from 'pages/SwapBapt'
import {useCallback, useEffect, useMemo, useState, useTransition} from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { Field } from 'state/swap/actions'
import { SwapState } from 'state/swap/reducer'
import styled from 'styled-components'
import { isAddress } from 'utils'
import { addressesAreEquivalent } from 'utils/addressesAreEquivalent'

import { OnChangeTimePeriod } from './ChartSection'
import InvalidTokenDetails from './InvalidTokenDetails'
import {TokenType} from "../TokenTable/TokenRow";
import Stake from 'components/Stake'
import {getTokenImgUrl, getTokenListInfo, getTokensStatistics} from "../../../apiRequests";
import { TOKEN_LIST } from 'constants/tokenList'

const TokenSymbol = styled.span`
  text-transform: uppercase;
  color: ${({ theme }) => theme.neutral2};
  margin-left: 8px;
`
const TokenActions = styled.div`
  display: flex;
  gap: 16px;
  color: ${({ theme }) => theme.neutral2};
`
const TokenTitle = styled.div`
  display: flex;
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.md}px) {
    display: inline;
  }
`

function useOnChainToken(address: string | undefined, skip: boolean) {

  const token = useTokenFromActiveNetwork(skip || !address ? undefined : address)

  if (skip || !address || (token && token?.symbol === UNKNOWN_TOKEN_SYMBOL)) {
    return undefined
  } else {
    return token
  }
}

// Selects most relevant token based on data available, preferring native > query > on-chain
// Token will be null if still loading from on-chain, and undefined if unavailable
function useRelevantToken(
  address: string | undefined,
  pageChainId: number,
  tokenQueryData: TokenQueryData | undefined
) {
  const { chainId: activeChainId } = useWeb3React()
  const queryToken = useMemo(() => {
    if (!address) return undefined
    if (address === NATIVE_CHAIN_ID) return nativeOnChain(pageChainId)
    if (tokenQueryData) return new QueryToken(address, tokenQueryData)
    return undefined
  }, [pageChainId, address, tokenQueryData])
  // fetches on-chain token if query data is missing and page chain matches global chain (else fetch won't work)
  const skipOnChainFetch = Boolean(queryToken) || pageChainId !== activeChainId
  const onChainToken = useOnChainToken(address, skipOnChainFetch)

  return useMemo(
    () => ({ token: queryToken ?? onChainToken, didFetchFromChain: !queryToken }),
    [onChainToken, queryToken]
  )
}

type TokenDetailsProps = {
  urlAddress?: string
  inputTokenAddress?: string
  chain?: InterfaceGqlChain
  tokenQuery?: TokenQuery
  tokenPriceQuery?: TokenPriceQuery
  onChangeTimePeriod?: OnChangeTimePeriod
  tokenAddress?: string
}
export default function TokenDetails({
  tokenAddress,
  urlAddress,
  inputTokenAddress,
  chain,
  tokenQuery,
  tokenPriceQuery,
  onChangeTimePeriod,
}: TokenDetailsProps) {
  /*if (!urlAddress) {
    throw new Error('Invalid token details route: tokenAddress param is undefined')
  }
  const address = useMemo(
    () => (urlAddress === NATIVE_CHAIN_ID ? urlAddress : isAddress(urlAddress) || undefined),
    [urlAddress]
  )

  const { chainId: connectedChainId } = useWeb3React()
  const pageChainId = supportedChainIdFromGQLChain(chain)
  const tokenQueryData = tokenQuery.token
  const crossChainMap = useMemo(
    () =>
      tokenQueryData?.project?.tokens.reduce((map, current) => {
        if (current) map[current.chain] = current.address
        return map
      }, {} as { [key: string]: string | undefined }) ?? {},
    [tokenQueryData]
  )

  const { token: detailedToken, didFetchFromChain } = useRelevantToken(address, pageChainId, tokenQueryData)

  const tokenWarning = address ? checkWarning(address) : null
  const isBlockedToken = tokenWarning?.canProceed === false
  const navigate = useNavigate()

  // Wrapping navigate in a transition prevents Suspense from unnecessarily showing fallbacks again.
  const [isPending, startTokenTransition] = useTransition()
  const navigateToTokenForChain = useCallback(
    (update: Chain) => {
      if (!address) return
      const bridgedAddress = crossChainMap[update]
      if (bridgedAddress) {
        startTokenTransition(() => navigate(getTokenDetailsURL({ address: bridgedAddress, chain: update })))
      } else if (didFetchFromChain || detailedToken?.isNative) {
        startTokenTransition(() => navigate(getTokenDetailsURL({ address, chain: update })))
      }
    },
    [address, crossChainMap, didFetchFromChain, navigate, detailedToken?.isNative]
  )
  useOnGlobalChainSwitch(navigateToTokenForChain)

  const handleCurrencyChange = useCallback(
    (tokens: Pick<SwapState, Field.INPUT | Field.OUTPUT>) => {
      if (
        addressesAreEquivalent(tokens[Field.INPUT]?.currencyId, address) ||
        addressesAreEquivalent(tokens[Field.OUTPUT]?.currencyId, address)
      ) {
        return
      }

      const newDefaultTokenID = tokens[Field.OUTPUT]?.currencyId ?? tokens[Field.INPUT]?.currencyId
      startTokenTransition(() =>
        navigate(
          getTokenDetailsURL({
            // The function falls back to "NATIVE" if the address is null
            address: newDefaultTokenID === 'ETH' ? null : newDefaultTokenID,
            chain,
            inputAddress:
              // If only one token was selected before we navigate, then it was the default token and it's being replaced.
              // On the new page, the *new* default token becomes the output, and we don't have another option to set as the input token.
              tokens[Field.INPUT] && tokens[Field.INPUT]?.currencyId !== newDefaultTokenID
                ? tokens[Field.INPUT]?.currencyId
                : null,
          })
        )
      )
    },
    [address, chain, navigate]
  )

  const [continueSwap, setContinueSwap] = useState<{ resolve: (value: boolean | PromiseLike<boolean>) => void }>()

  const [openTokenSafetyModal, setOpenTokenSafetyModal] = useState(false)

  const onResolveSwap = useCallback(
    (value: boolean) => {
      continueSwap?.resolve(value)
      setContinueSwap(undefined)
    },
    [continueSwap, setContinueSwap]
  )

  // address will never be undefined if token is defined; address is checked here to appease typechecker
  if (detailedToken === undefined || !address) {
    return <InvalidTokenDetails pageChainId={pageChainId} isInvalidAddress={!address} />
  }*/

  const [token, setToken] = useState(null);
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    getTokenListInfo().then((res: any) => {
      console.log(res)
      //console.log(res.find((item: any) => item.name === "APT"))
    })
    getTokensStatistics().then((res: any) => {
      console.log(res)
      const data = {
        token: {
          market: {
            priceHistory: res.token_price_chart.map((item: {x: string, y: string}, index: number) => ({
              id: index,
              timestamp: Date.parse(item?.x),
              value: item?.y
            }))
          }
        }
      }
      console.log(data)
      setPrices(data as any);
      setToken(res.top_tokens_by_volume.find((el: TokenType) => el.token === tokenAddress));
    });
  }, []);
  const defaultOutputTokenIndex = TOKEN_LIST.findIndex(x => x.symbol === tokenAddress || x.synonym === tokenAddress);
  return (
    <Trace
    >
      <TokenDetailsLayout>
        {token ? (
          <LeftPanel>
            <BreadcrumbNavLink to={`/tokens`}>
              <ArrowLeft data-testid="token-details-return-button" size={14} /> Tokens
            </BreadcrumbNavLink>
            <TokenInfoContainer data-testid="token-info-container">
              <TokenNameCell>
                {/*<CurrencyLogo currency={detailedToken} size="32px" hideL2Icon={false} />*/}
                <img src={getTokenImgUrl(tokenAddress || "")} alt="" width={32} height={32}/>
                <TokenTitle>
                  {tokenAddress ?? <Trans>Name not found</Trans>}
                  {/*<TokenSymbol>{"symbol" ?? <Trans>Symbol not found</Trans>}</TokenSymbol>*/}
                </TokenTitle>
              </TokenNameCell>
              {/*<TokenActions>
                <ShareButton currency={detailedToken} />
              </TokenActions>*/}
            </TokenInfoContainer>
            <ChartSection tokenPriceQuery={prices as any} onChangeTimePeriod={() => null} />

            <StatsSection
              TVL={null}
              volume24H={token["volume_24h"]}
              priceHigh52W={null}
              priceLow52W={null}
            />
            <Hr />
            <AboutSection
              address={"-"}
              chainId={1}
              description={"-"}
              homepageUrl={"homepageUrl"}
              twitterName={"twitterName"}
            />
            {true && <AddressSection address={"-"} />}
          </LeftPanel>
        ) : (
          <TokenDetailsSkeleton />
        )}

        <RightPanel>
          {/*<div>
            <Swap
              chainId={pageChainId}
              initialInputCurrencyId={inputTokenAddress}
              initialOutputCurrencyId={address === NATIVE_CHAIN_ID ? 'ETH' : address}
              onCurrencyChange={handleCurrencyChange}
              disableTokenInputs={pageChainId !== connectedChainId}
            />
          </div>
          {tokenWarning && <TokenSafetyMessage tokenAddress={address} warning={tokenWarning} />}
          {detailedToken && <BalanceSummary token={detailedToken} />}*/}
          <Swap defaultOutputTokenIndex={defaultOutputTokenIndex > -1 ? defaultOutputTokenIndex : 9}/>
          <Stake defaultOutputTokenIndex={defaultOutputTokenIndex > -1 ? defaultOutputTokenIndex : 9}/>
        </RightPanel>
        {/*{detailedToken && <MobileBalanceSummaryFooter token={detailedToken} />}*/}

        {/*<TokenSafetyModal
          isOpen={openTokenSafetyModal || !!continueSwap}
          tokenAddress={address}
          onContinue={() => onResolveSwap(true)}
          onBlocked={() => {
            setOpenTokenSafetyModal(false)
          }}
          onCancel={() => onResolveSwap(false)}
          showCancel={true}
        />*/}
      </TokenDetailsLayout>
    </Trace>
  )
}
