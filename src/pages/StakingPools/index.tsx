import styled from "styled-components";
import {Trans} from "@lingui/macro";
import {ThemedText} from "../../theme/components";
import {MAX_WIDTH_MEDIA_BREAKPOINT} from "../../components/Tokens/constants";

const ExploreContainer = styled.div`
  width: 100%;
  min-width: 320px;
  padding: 68px 12px;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
`
const TitleContainer = styled.div`
  margin-bottom: 32px;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  margin-left: auto;
  margin-right: auto;
  display: flex;
`
const BasicContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 12px;
  padding: 12px 16px;
  width: 100%;
`
const InnerContainer = styled.div`
  display: flex;
  gap: 15px;
`

const ButtonsContainer = styled(InnerContainer)`
  margin-top: 12px;
`

const StakingPools = () => {
    return (
        <ExploreContainer>
            <TitleContainer>
                <ThemedText.LargeHeader>
                    <Trans>Current staking pools</Trans>
                </ThemedText.LargeHeader>
            </TitleContainer>
            <BasicContainer>
                Current staking pools
            </BasicContainer>
        </ExploreContainer>
    )
}
export default StakingPools