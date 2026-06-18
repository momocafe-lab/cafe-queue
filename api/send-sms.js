export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { to, message } = req.body
  try {
    const url = `https://api.tawasolsms.com/index.php?user=${process.env.TAWASOL_USERNAME}&pass=${process.env.TAWASOL_PASSWORD}&sid=${process.env.TAWASOL_SENDER}&mno=${to}&text=${encodeURIComponent(message)}&type=1`
    const response = await fetch(url, { method: 'GET' })
    const data = await response.json()
    console.log('Tawasol response:', JSON.stringify(data))
    res.status(200).json({ success: true })
  } catch (error) {
    console.log('Tawasol error:', error.message)
    res.status(500).json({ error: error.message })
  }
}