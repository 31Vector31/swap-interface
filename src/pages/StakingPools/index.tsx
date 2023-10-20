import styled from "styled-components";
import {Trans} from "@lingui/macro";
import {ThemedText} from "../../theme/components";
import {MAX_WIDTH_MEDIA_BREAKPOINT} from "../../components/Tokens/constants";
import ItemPool from "./ItemPool";

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
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const rewardsPoolList = [
    {
        stakedToken: {
            name: "BaptLabs",
            symbol: "BAPTV1",
            iconSrc: 5,
            address:
                "0xb73a7b82af68fc1ba6e123688b95adec1fec0bcfc256b5d3a43de227331a7abd::baptlabs::BaptLabs",
            decimals: 8,
        },
        pairedToken: 5,
    },
    {
        stakedToken: {
            name: "MAU Protocol",
            symbol: "MAU",
            iconSrc: 5,
            address:
                "0xf8fa55ff4265fa9586f74d00da4858b8a0d2320bbe94cb0e91bf3a40773eb60::MAU::MAU",
            decimals: 6,
        },
        pairedToken: 4,
    },
];

const StakingPools = () => {
    return (
        <ExploreContainer>
            <TitleContainer>
                <ThemedText.LargeHeader>
                    <Trans>Current staking pools</Trans>
                </ThemedText.LargeHeader>
            </TitleContainer>
            <BasicContainer>
                {rewardsPoolList && rewardsPoolList.map(
                    (pool: any, index) => <ItemPool pool={pool} key={index}/>
                )}
            </BasicContainer>
        </ExploreContainer>
    )
}
export default StakingPools