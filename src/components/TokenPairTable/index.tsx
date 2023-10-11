import styled from "styled-components";

const Container = styled.div`
  border: 1px solid ${({theme}) => theme.surface3};
  border-radius: 12px;
  padding: 16px 20px;
  width: 100%;
  margin-top: 12px;
`
const Table = styled.div`

`
const Header = styled.div`
  display: flex;
  margin-bottom: 10px;
  gap: 5px;
`
const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const Row = styled.div`
  display: flex;
  justify-content: space-between;
`
const Title = styled.div`

`
const Subtitle = styled.div`
  color: ${({theme}) => theme.neutral2};
`
const RowKey = styled.div`
  font-size: 12px;
`
const RowValue = styled.div`
  color: ${({theme}) => theme.neutral2};
`

interface TableProps {
    title?: string
    subtitle?: string
    body?: object[]
}

const TokenPairTable = ({title, subtitle, body}: TableProps) => {

    return (
        <Container>
            <Table>
                <Header>
                    <Title>{title}</Title>
                    <Subtitle>{subtitle}</Subtitle>
                </Header>
                <Body>
                    {body && body.map(
                        ({key, value}: any, index) => {
                            return (
                                <Row key={index}>
                                    {key && <RowKey>{key}</RowKey>}
                                    <RowValue>{value}</RowValue>
                                </Row>
                            );
                        }
                    )}
                </Body>
            </Table>
        </Container>
    )
}

export default TokenPairTable

