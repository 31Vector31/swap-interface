import {ThemedText} from "../../theme/components";
import {Trans} from "@lingui/macro";
import {RowBetween, RowFixed} from "../../components/Row";
import styled from "styled-components";

const StyledSwapHeader = styled(RowBetween)`
  margin-bottom: 10px;
  color: ${({ theme }) => theme.neutral2};
`

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0 12px;
  gap: 16px;
`

export default function SwapHeader() {
    return (
        <StyledSwapHeader>
            <HeaderButtonContainer>
                <ThemedText.SubHeader>
                    <Trans>Swap</Trans>
                </ThemedText.SubHeader>
            </HeaderButtonContainer>
            {/*<RowFixed>
                <SettingsTab autoSlippage={autoSlippage} chainId={chainId} trade={trade} />
            </RowFixed>*/}
        </StyledSwapHeader>
    )
}