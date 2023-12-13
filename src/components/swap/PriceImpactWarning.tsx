import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { OutlineCard } from 'components/Card'
import styled, { useTheme } from 'styled-components'
import { ThemedText } from 'theme/components'
import { opacify } from 'theme/utils'
import { useFormatter } from 'utils/formatNumbers'

import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { MouseoverTooltip } from '../Tooltip'

const StyledCard = styled(OutlineCard)`
  padding: 12px;
  border: 1px solid ${({ theme }) => opacify(24, theme.critical)};
`

interface PriceImpactWarningProps {
  priceImpact: Percent | string
}

export default function PriceImpactWarning({ priceImpact }: PriceImpactWarningProps) {
  const { formatPriceImpact } = useFormatter()
  const theme = useTheme()

  return (
    <StyledCard>
      <AutoColumn gap="sm">
        <MouseoverTooltip
          text={
            <>
              A swap of this size may have a high price impact, given the current liquidity in the pool. There may be a
              large difference between the amount of your input token and what you will receive in the output token
            </>
          }
        >
          <RowBetween>
            <RowFixed>
              <ThemedText.DeprecatedSubHeader color={theme.critical}>
                Price impact warning
              </ThemedText.DeprecatedSubHeader>
            </RowFixed>
            <ThemedText.DeprecatedLabel textAlign="right" fontSize={14} color="critical">
              {typeof priceImpact === "string" ? priceImpact : formatPriceImpact(priceImpact)}
            </ThemedText.DeprecatedLabel>
          </RowBetween>
        </MouseoverTooltip>
      </AutoColumn>
    </StyledCard>
  )
}
