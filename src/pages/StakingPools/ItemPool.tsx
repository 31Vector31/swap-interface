import {Trans} from "@lingui/macro";
import {ButtonEmphasis, ButtonLight, ButtonSize, ThemeButton} from "../../components/Button";
import {Input as NumericalInput} from "../../components/NumericalInput";
import {useState} from "react";
import styled, { css, useTheme } from 'styled-components'

const Container = styled.div`
  border: 1px solid ${({theme}) => theme.surface3};
  border-radius: 12px;
  padding: 16px 20px;
  width: 100%;
`
const Pool = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const Header = styled.div`
  cursor: pointer;
  padding-top: 15px;
  padding-bottom: 15px;
  padding-left: 12px;
  padding-right: 12px;
  
  display: flex;
  align-items: center;
  
  & > div:nth-child(1) {
    flex: 1;
    display: flex;
    justify-content: center;

    color: #9B9B9B;
    min-width: 32px;
    font-size: 14px;
  }

  & > div:nth-child(2) {
    flex: 10;
  }

  & > div:nth-child(3) {
    flex: 1;
  }

  transition: ${({
                   theme: {
                     transition: { duration, timing },
                   },
                 }) => css`background-color ${duration.medium} ${timing.ease}`};
  transition-duration: ${({ theme }) => theme.transition.duration.fast};

  &:hover {
    ${({ theme }) => css`background-color: ${theme.deprecated_hoverDefault};`}
  }
`
const HeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const HeaderTitle = styled.div`
  line-height: 24px;
  font-size: 16px;
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

const Logo = styled.img`
  border-radius: 50%;
`

const Details = styled.div`
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ItemPool = ({pool, index}: any) => {

    const [showDetails, setShowDetails] = useState<boolean>(false);
    const revealDetails = () => setShowDetails(!showDetails);

    return (
        <Pool>
            <Header onClick={()=>revealDetails()}>
                <div>{index}</div>
                <HeaderMain>
                    <Logo src={pool.img} alt={pool.name} width={32} height={32}/>
                    <HeaderTitle>{pool.name}</HeaderTitle>
                </HeaderMain>
                <div><ThemeButton size={ButtonSize.small} emphasis={ButtonEmphasis.low}>Stake</ThemeButton></div>
            </Header>
            {showDetails &&
                <Details>
                    <InnerContainer>
                        <Rewards>
                            <BlockTitle>Your Rewards</BlockTitle>
                            <RewardsBody>
                                <Value>0 APT</Value>
                                <Value>0 {pool.symbol}</Value>
                            </RewardsBody>
                            <StyledButtonLight>
                                <Trans>Connect wallet</Trans>
                            </StyledButtonLight>
                        </Rewards>
                        <ManageStake>
                            <BlockTitle>Manage Stake</BlockTitle>
                            <div>Balance: <Value>0 {pool.symbol}</Value></div>
                            <InputContainer>
                                <StyledNumericalInput value={""} onUserInput={()=>{}} placeholder={"Ex. 1 " + pool.symbol}/>
                                <ThemeButton size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Connect</ThemeButton>
                            </InputContainer>
                            <InputContainer>
                                <StyledNumericalInput value={""} onUserInput={()=>{}} placeholder={"Ex. 1 " + pool.symbol}/>
                                <ThemeButton size={ButtonSize.small} emphasis={ButtonEmphasis.highSoft}>Connect</ThemeButton>
                            </InputContainer>
                        </ManageStake>
                    </InnerContainer>
                    <Stake>
                        <div>Your stake:</div>
                        <Value>0 {pool.symbol}</Value>
                    </Stake>
                    <Stake>
                        <div>Total staked:</div>
                        <Value>0 {pool.symbol}</Value>
                    </Stake>
                </Details>}
        </Pool>
    )
}
export default ItemPool