import styled from "styled-components";

const MainToken = styled.img`
  
`
const MinorToken = styled.img`
  margin-left: -15px;
`
const OverlappingTokenIcons = () => {

    return (
        <div>
            <MainToken src="/images/tokens/usd-coin.png" width={56} height={56} alt=""/>
            <MinorToken src="/images/tokens/apt.png" width={56} height={56} alt=""/>
        </div>
    )
}

export default OverlappingTokenIcons