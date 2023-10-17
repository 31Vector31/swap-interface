import styled from "styled-components";
import {Trans} from "@lingui/macro";
import {ThemedText} from "../../theme/components";
import {MAX_WIDTH_MEDIA_BREAKPOINT} from "../../components/Tokens/constants";
import TokenPairTable from "components/TokenPairTable";
import TokenPairHeader from "./TokenPairHeader";
import {ButtonEmphasis, ButtonSize, ThemeButton} from "../../components/Button";

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

const TokenPairInfo = () => {

    return (
        <ExploreContainer>
            <TitleContainer>
                <ThemedText.LargeHeader>
                    <Trans>Token pair info</Trans>
                </ThemedText.LargeHeader>
            </TitleContainer>
            <BasicContainer>
                <TokenPairHeader/>
                <InnerContainer>
                    <TokenPairTable title={"Aptos"} subtitle={"APT"} body={[{key:"Decimals", value:"8"},{key:"Pair Reserve", value:"20.64618199"},{key:"Team Balance", value:"8"}]}/>
                    <TokenPairTable title={"Aptos"} subtitle={"APT"} body={[{key:"Decimals", value:"8"},{key:"Pair Reserve", value:"20.64618199"},{key:"Team Balance", value:"8"}]}/>
                </InnerContainer>
                <TokenPairTable title={"Pair Owner Address"} body={[{value:"0x045u456ijtrdkfjlkgi5u49ikdj4i4"}]}/>
                <TokenPairTable title={"Tax Breakdown"} body={[{key:"Liquidity Fee", value:"0%"},{key:"Team Fee", value:"0%"},{key:"Rewards Fee", value:"0%"}]}/>
                <ButtonsContainer>
                    <ThemeButton size={ButtonSize.medium} emphasis={ButtonEmphasis.highSoft}>Withdraw Team Fees</ThemeButton>
                    <ThemeButton size={ButtonSize.medium} emphasis={ButtonEmphasis.highSoft}>Edit Fees</ThemeButton>
                    <ThemeButton size={ButtonSize.medium} emphasis={ButtonEmphasis.highSoft}>Initialize Rewards Pool</ThemeButton>
                    <ThemeButton size={ButtonSize.medium} emphasis={ButtonEmphasis.highSoft}>Withdraw Treasury Fees</ThemeButton>
                </ButtonsContainer>
            </BasicContainer>
        </ExploreContainer>
    )
}

export default TokenPairInfo

