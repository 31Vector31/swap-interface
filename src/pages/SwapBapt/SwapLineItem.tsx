import {RowBetween} from "../../components/Row";
import React from "react";
import styled, {DefaultTheme} from "styled-components";
import {ThemedText} from "../../theme/components";
import {t} from "@lingui/macro";

const DetailRowValue = styled(ThemedText.BodySmall)`
  text-align: right;
  overflow-wrap: break-word;
  display: flex;
  align-items: center;
`
const LabelText = styled(ThemedText.BodySmall)<{ hasTooltip?: boolean }>`
  cursor: ${({ hasTooltip }) => (hasTooltip ? 'help' : 'auto')};
  color: ${({ theme }) => theme.neutral2};
`

interface SwapLineItemProps {
    label: string
    value: string
    color?: string
    image?: string | null | undefined
}

export default function SwapLineItem({label, value, color = "white", image = null}: SwapLineItemProps) {
    /* white: white, red: critical, yellow: deprecated_accentWarningSoft, warning: deprecated_accentWarning */
    return (
        <RowBetween>
            <LabelText data-testid="swap-li-label">
                {label}
            </LabelText>
            <ThemedText.Caption color="critical">
                
                <DetailRowValue color={color}>
                    {image && <img src={image || ""} alt="" style={{ width: "24px", height: "24px", marginRight: "6px" }} />}
                    {value}
                </DetailRowValue>
            </ThemedText.Caption>
        </RowBetween>
    )
}