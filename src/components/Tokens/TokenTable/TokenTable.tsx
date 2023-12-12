import { Trans } from '@lingui/macro'
import { PAGE_SIZE, useTopTokens } from 'graphql/data/TopTokens'
import { validateUrlChainParam } from 'graphql/data/util'
import {ReactNode, useEffect, useState} from 'react'
import { AlertTriangle } from 'react-feather'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { MAX_WIDTH_MEDIA_BREAKPOINT } from '../constants'
import { HeaderRow, LoadedRow, LoadingRow } from './TokenRow'
import {TokenPairMetadataType} from "../../../pages/SwapBapt";
import {getTokenInfo, getTokenListInfo, getTokensStatistics} from "../../../apiRequests";

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  background-color: ${({ theme }) => theme.surface1};

  margin-left: auto;
  margin-right: auto;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.surface3};
`

const TokenDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  width: 100%;
`

const NoTokenDisplay = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 60px;
  color: ${({ theme }) => theme.neutral2};
  font-size: 16px;
  font-weight: 535;
  align-items: center;
  padding: 0px 28px;
  gap: 8px;
`

function NoTokensState({ message }: { message: ReactNode }) {
  return (
    <GridContainer>
      <HeaderRow />
      <NoTokenDisplay>{message}</NoTokenDisplay>
    </GridContainer>
  )
}

const LoadingRows = ({ rowCount }: { rowCount: number }) => (
  <>
    {Array(rowCount)
      .fill(null)
      .map((_, index) => {
        return <LoadingRow key={index} first={index === 0} last={index === rowCount - 1} />
      })}
  </>
)

function LoadingTokenTable({ rowCount = PAGE_SIZE }: { rowCount?: number }) {
  return (
    <GridContainer>
      <HeaderRow />
      <TokenDataContainer>
        <LoadingRows rowCount={rowCount} />
      </TokenDataContainer>
    </GridContainer>
  )
}

export default function TokenTable() {
  /*const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)
  const { tokens, tokenSortRank, loadingTokens, sparklines } = useTopTokens(chainName)*/

  const [tokens, setTokens] = useState([]);

  const getDetailedSingleInfo = async (uniqueNeededTokens: any) => {
    const promises = uniqueNeededTokens.map((item: { type: string }) => getTokenInfo(item.type));
    return Promise.all(promises);
  }

  useEffect(() => {
      getTokensStatistics().then((res: any) => {
        const resTokens = res.top_tokens_by_volume || []
        console.log(res)
        setTokens(resTokens);
        getTokenListInfo().then(async (res: any) => {
          const allTokens = res || [];
          console.log(allTokens)

          const neededNames: string[] = resTokens.map((item: { token?: string }) => item.token);
          const neededTokens = allTokens.filter((item: any) => neededNames.includes(item.label))
          console.log(neededTokens)
          
          const uniqueNeededTokens = [...new Map(neededTokens.map((item: { label?: string }) =>
            [item["label"], item])).values()];
          
          console.log(uniqueNeededTokens)
          console.log(await getDetailedSingleInfo(uniqueNeededTokens))
        })
      });
  }, []);

  /* loading and error state */
  if (!tokens) {
    return <LoadingTokenTable rowCount={PAGE_SIZE} />
  } else {
    return (
      <GridContainer>
        <HeaderRow />
        <TokenDataContainer>
          {tokens.map(
            (token, index) =>
              (
                <LoadedRow
                  key={index}
                  token={token}
                  sortRank={index+1}
                />
              )
          )}
        </TokenDataContainer>
      </GridContainer>
    )
  }
}
