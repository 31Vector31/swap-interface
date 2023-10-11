import styled from "styled-components";
import OverlappingTokenIcons from "./OverlappingTokenIcons";

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  width: 100%;
  gap: 50px;
`
const Tokens = styled.div`
  display: flex;
  gap: 10px;
`
const MainToken = styled.div`
  font-weight: 700;
`
const MinorToken = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.neutral2};
`

const TokenPairHeader = () => {

    return (
        <Header>
            <OverlappingTokenIcons/>
            <Tokens>
                <MainToken>USDC-Aptos</MainToken>
                <MinorToken>USDC-APT</MinorToken>
            </Tokens>
        </Header>
    )
}

export default TokenPairHeader