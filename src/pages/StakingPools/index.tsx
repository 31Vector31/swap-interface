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
  width: 100%;
  display: flex;
  flex-direction: column;
`

const TableHeader = styled.div`
  padding-top: 15px;
  padding-bottom: 15px;
  padding-left: 12px;
  padding-right: 12px;
  border-bottom: 1px solid #FFFFFF12;
  color: #9B9B9B;
  font-size: 14px;
  height: 48px;
  line-height: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  
  & > div:nth-child(1) {
    flex: 1;
    display: flex;
    justify-content: center;
    min-width: 32px;
  }

  & > div:nth-child(2) {
    flex: 10;
  }

  & > div:nth-child(3) {
    flex: 1;
  }
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
                <TableHeader>
                    <div>#</div>
                    <div>Pool name</div>
                    <div></div>
                </TableHeader>
                {rewardsPoolList && rewardsPoolList.map(
                    (pool: any, index) => <ItemPool pool={pool} key={index} index={index + 1}/>
                )}
            </BasicContainer>
        </ExploreContainer>
    )
}
export default StakingPools