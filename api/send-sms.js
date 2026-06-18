const twilio = require('twilio')
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { to, message } = req.body
  try {
    await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: to })
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}