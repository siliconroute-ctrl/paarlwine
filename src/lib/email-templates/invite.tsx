import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Click the button below to accept the invitation and create your
          account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#2b1d1a' }
const container = { padding: '32px 28px', maxWidth: '600px' }
const h1 = {
  fontSize: '28px',
  fontWeight: 'normal' as const,
  color: '#4a1220',
  fontFamily: 'Georgia, "Times New Roman", serif',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#4b3b33',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: '#a8842c', textDecoration: 'underline' }
const button = {
  backgroundColor: '#4a1220',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#8b7355', margin: '30px 0 0' }
