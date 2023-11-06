import {ThemedText} from "../../theme/components";
import {Trans} from "@lingui/macro";
import {RowBetween, RowFixed} from "../Row";
import styled from "styled-components";
import {manageStakeSections} from "./index";

const StyledSwapHeader = styled(RowBetween)`
  margin-bottom: 10px;
  color: ${({ theme }) => theme.neutral2};
`

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0 12px;
  gap: 16px;
`

const SubHeader = styled(ThemedText.SubHeader)<{ active?: boolean }>`
  color: ${({ active, theme }) => (active ? theme.neutral1 : theme.neutral2)};
  cursor: pointer;
  user-select: none;
  
  &:hover {
    opacity: 0.9;
  }
`

interface SwapHeaderProps {
    selectedTab: number
    setSelectedTab: (value: number) => void
}

export default function SwapHeader({selectedTab, setSelectedTab}: SwapHeaderProps) {
    return (
        <StyledSwapHeader>
            <HeaderButtonContainer>
                {manageStakeSections.map((section, index) => (
                    <SubHeader active={index === selectedTab} onClick={()=>setSelectedTab(index)}>
                        <Trans>{section}</Trans>
                    </SubHeader>))}
            </HeaderButtonContainer>
            {/*<RowFixed>
                <SettingsTab autoSlippage={autoSlippage} chainId={chainId} trade={trade} />
            </RowFixed>*/}
        </StyledSwapHeader>
    )
}