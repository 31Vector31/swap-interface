import styled from "styled-components";
import {Trans} from "@lingui/macro";
import {ButtonEmphasis, ButtonLight, ButtonSize, ThemeButton} from "../../components/Button";
import {Input as NumericalInput} from "../../components/NumericalInput";
import {useState} from "react";

const Container = styled.div`
  border: 1px solid ${({theme}) => theme.surface3};
  border-radius: 12px;
  padding: 16px 20px;
  width: 100%;
`
const Pool = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const HeaderMain = styled.div`
  display: flex;
  gap: 10px;
`
const HeaderTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
`
const InnerContainer = styled.div`
  display: flex;
  gap: 15px;
`
const StyledNumericalInput = styled(NumericalInput)`
  text-align: left;
  width: 100%;
  font-size: 20px;
`
const InputContainer = styled.div`
  background-color: #1B1B1B;
  border-radius: 16px;
  color: #9B9B9B;
  padding: 16px;
  display: flex;
`
const Stake = styled.div`
  display: flex;
  justify-content: space-between;
`
const StyledButtonLight = styled(ButtonLight)`
  border-radius: 16px;
  font-weight: 535;
`
const Rewards = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 7px;
`
const ManageStake = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: 7px;
`
const RewardsBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`
const BlockTitle = styled.div`
  font-size: 20px;
`
const Value = styled.span`
  color: ${({theme}) => theme.neutral2};
`

const ItemPool = ({pool}: any) => {

    const [showDetails, setShowDetails] = useState<boolean>(false);
    const revealDetails = () => setShowDetails(!showDetails);

    return (
        <Pool>
            <Header onClick={()=>revealDetails()}>
                <HeaderMain>
                    <img src="/images/baptlabs-mini.png" alt="baptlabs" width={56} height={56}/>
                    <HeaderTitle>Stake BAPT</HeaderTitle>
                </HeaderMain>
                <div><ThemeButton size={ButtonSize.small} emphasis={ButtonEmphasis.low}>{showDetails ? "HIDE" : "EXPAND"}</ThemeButton></div>
            </Header>
            {showDetails &&
                <>
                    <InnerContainer>
                        <Rewards>
                            <BlockTitle>Your Rewards</BlockTitle>
                            <RewardsBody>
                                <Value>0 APT</Value>
                                <Value>0 BAPT</Value>
                            </RewardsBody>
                            <StyledButtonLight>
                                <Trans>Connect wallet</Trans>
                            </StyledButtonLight>
                        </Rewards>
                        <ManageStake>
                            <BlockTitle>Manage Stake</BlockTitle>
                            <div>Balance: <Value>0 BAPT</Value></div>
                            <InputContainer>
                                <StyledNumericalInput value={""} onUserInput={()=>{}} placeholder={"Ex. 1 BAPT"}/>
                                <ThemeButton size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Connect</ThemeButton>
                            </InputContainer>
                            <InputContainer>
                                <StyledNumericalInput value={""} onUserInput={()=>{}} placeholder={"Ex. 1 BAPT"}/>
                                <ThemeButton size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Connect</ThemeButton>
                            </InputContainer>
                        </ManageStake>
                    </InnerContainer>
                    <Stake>
                        <div>Your stake:</div>
                        <Value>0 BAPT</Value>
                    </Stake>
                    <Stake>
                        <div>Total staked:</div>
                        <Value>0 BAPT</Value>
                    </Stake>
                </>}
        </Pool>
    )
}
export default ItemPool