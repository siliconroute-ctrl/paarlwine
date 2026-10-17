import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  message?: string
  isEstate?: boolean
  estateName?: string | null
  submittedAt?: string
}

const ContactNotification = ({
  name = 'Someone',
  email = 'unknown@example.com',
  message = '(no message)',
  isEstate = false,
  estateName,
  submittedAt,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New message from ${name}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>PAARL WINE</Text>
        <Heading style={heading}>New contact message</Heading>

        <Section style={card}>
          <Text style={row}>
            <span style={label}>Name</span>
            <br />
            {name}
          </Text>
          <Text style={row}>
            <span style={label}>Email</span>
            <br />
            {email}
          </Text>
          <Text style={row}>
            <span style={label}>Wine estate</span>
            <br />
            {isEstate ? estateName || 'Yes (estate name not given)' : 'No'}
          </Text>
          {submittedAt ? (
            <Text style={row}>
              <span style={label}>Submitted</span>
              <br />
              {submittedAt}
            </Text>
          ) : null}
        </Section>

        <Hr style={hr} />

        <Text style={label}>Message</Text>
        <Text style={messageStyle}>{message}</Text>

        <Hr style={hr} />
        <Text style={footer}>
          Reply directly to this email to respond to {name}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactNotification,
  subject: (data: Record<string, any>) =>
    `New contact message from ${data?.name || 'a visitor'}`,
  displayName: 'Contact form notification',
  to: 'hello@paarlwine.com',
  previewData: {
    name: 'Anika de Villiers',
    email: 'anika@example.com',
    message: 'We would love to list our estate on the guide.',
    isEstate: true,
    estateName: 'Klein Drakenstein',
    submittedAt: '29 July 2026, 14:12 SAST',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Georgia, "Times New Roman", serif',
  color: '#2b1d1a',
}
const container = { padding: '32px 28px', maxWidth: '600px' }
const eyebrow = {
  fontSize: '11px',
  letterSpacing: '3px',
  color: '#a8842c',
  margin: '0 0 8px',
  fontFamily: 'Arial, sans-serif',
}
const heading = { fontSize: '28px', margin: '0 0 20px', color: '#4a1220' }
const card = {
  backgroundColor: '#faf6ef',
  borderRadius: '8px',
  padding: '18px 20px',
  border: '1px solid #ece2d0',
}
const row = { fontSize: '15px', margin: '0 0 12px', fontFamily: 'Arial, sans-serif' }
const label = {
  fontSize: '11px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase' as const,
  color: '#8b7355',
  fontFamily: 'Arial, sans-serif',
}
const messageStyle = {
  fontSize: '15px',
  lineHeight: '24px',
  whiteSpace: 'pre-wrap' as const,
  fontFamily: 'Arial, sans-serif',
}
const hr = { borderColor: '#ece2d0', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#8b7355', fontFamily: 'Arial, sans-serif' }
