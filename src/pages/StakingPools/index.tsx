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
        name: "Stake BAPT",
        img: "/images/baptlabs-mini.png",
        symbol: "BAPT",
    },
    {
        name: "Stake PEPE",
        img: "/images/pepelogo.png",
        symbol: "PEPE",
    },
    {
        name: "Stake NEBULA",
        img: "/images/nebula.png",
        symbol: "NEBULA",
    },
    {
        name: "Stake BAPTV1",
        img: "/images/baptlabs-mini.png",
        symbol: "BAPTV1",
    },
    {
        name: "Stake MAU",
        img: "/images/MAU-icon.jpeg",
        symbol: "MAU",
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