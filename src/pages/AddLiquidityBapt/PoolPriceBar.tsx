import { Trans } from '@lingui/macro'
import { Currency, Percent, Price } from '@uniswap/sdk-core'
import { Text } from 'rebass'
import { useTheme } from 'styled-components'
import { ThemedText } from 'theme/components'

import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { ONE_BIPS } from '../../constants/misc'
import { Field } from '../../state/mint/actions'
import {TokenPairMetadataType} from "../SwapBapt";
import {TOKEN_LIST} from "../../constants/tokenList";
import {useEffect, useMemo, useState} from "react";
import {formatBalance} from "../../utils/sundry";

export function PoolPriceBar({
  noLiquidity,
  poolTokenPercentage,
  price,
  tokenPairMetadata,
  inputToken,
  outputToken
}: {
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price<Currency, Currency>
  tokenPairMetadata: TokenPairMetadataType
  inputToken: number
  outputToken: number
}) {
  const theme = useTheme()

  /*let invertedPrice: string | undefined
  try {
    invertedPrice = price?.invert()?.toSignificant(6)
  } catch (error) {
    invertedPrice = undefined
  }*/

  const [priceA, setPriceA] = useState("");
  const [priceB, setPriceB] = useState("");

  useEffect(() => {
    const inputTokenBalance = formatBalance(Number(tokenPairMetadata.balance_x), TOKEN_LIST[inputToken].decimals);
    const outputTokenBalance = formatBalance(Number(tokenPairMetadata.balance_y), TOKEN_LIST[outputToken].decimals);
    setPriceA((outputTokenBalance/inputTokenBalance).toFixed(4));
    setPriceB((inputTokenBalance/outputTokenBalance).toFixed(4));
  }, [tokenPairMetadata, inputToken, outputToken]);

  return (
    <AutoColumn gap="md">
      <AutoRow justify="space-around" gap="4px">
        <AutoColumn justify="center">
          <ThemedText.DeprecatedBlack data-testid="currency-b-price">
            {priceA ?? '-'}
          </ThemedText.DeprecatedBlack>
          <Text fontWeight={535} fontSize={14} color={theme.neutral2} pt={1}>
            <Trans>
              {TOKEN_LIST[outputToken]?.symbol} per {TOKEN_LIST[inputToken]?.symbol}
            </Trans>
          </Text>
        </AutoColumn>
        <AutoColumn justify="center">
          <ThemedText.DeprecatedBlack data-testid="currency-a-price">{priceB ?? '-'}</ThemedText.DeprecatedBlack>
          <Text fontWeight={535} fontSize={14} color={theme.neutral2} pt={1}>
            <Trans>
              {TOKEN_LIST[inputToken]?.symbol} per {TOKEN_LIST[outputToken]?.symbol}
            </Trans>
          </Text>
        </AutoColumn>
        <AutoColumn justify="center">
          <ThemedText.DeprecatedBlack>
            {noLiquidity && price
              ? '100'
              : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
            %
          </ThemedText.DeprecatedBlack>
          <Text fontWeight={535} fontSize={14} color={theme.neutral2} pt={1}>
            <Trans>Share of pool</Trans>
          </Text>
        </AutoColumn>
      </AutoRow>
    </AutoColumn>
  )
}
