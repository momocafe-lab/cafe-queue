export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { to, message } = req.body
  try {
    const response = await fetch('https://www.tawasolsms.com/api/SMSServices/Sendsms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.TAWASOL_USERNAME,
        password: process.env.TAWASOL_PASSWORD,
        mobile: to,
        message: message,
        sender: process.env.TAWASOL_SENDER
      })
    })
    const data = await response.json()
    console.log('Tawasol response:', JSON.stringify(data))
    res.status(200).json({ success: true })
  } catch (error) {
    console.log('Tawasol error:', error.message)
    res.status(500).json({ error: error.message })
  }
}