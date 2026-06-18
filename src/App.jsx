import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://lcmrdllohmlуpdxgtgln.supabase.co',
  'sb_publishable_8qeha-wJwMdkumuxdCQspw_R--_pTPe'
)

export default function App() {
  const page = window.location.pathname
  if (page === '/staff') return <StaffPage />
  return <JoinPage />
}

function JoinPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState(1)
  const [done, setDone] = useState(false)

  async function handleJoin() {
    if (!name || !phone) return alert('يرجى تعبئة جميع الحقول')
    const { error } = await supabase.from('waitlist').insert({
      name,
      phone,
      party_size: partySize,
      branch_id: '867b7d6a-8e6d-475b-9ab2-0768977fb5d4'
    })
    if (error) console.log('Supabase error:', error.message)
    await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone, message: 'تم تسجيلك في قائمة الانتظار' })
    })
    setDone(true)
  }

  if (done) return (
    <div style={styles.center}>
      <h2 style={styles.success}>✅ تم تسجيلك في قائمة الانتظار</h2>
      <p style={styles.sub}>سيتم إرسال رسالة على جوالك عند جاهزية طاولتك</p>
      <button style={styles.btn} onClick={() => setDone(false)}>تسجيل عميل جديد</button>
    </div>
  )

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>قائمة الانتظار</h1>
      <div style={styles.card}>
        <label style={styles.label}>الاسم</label>
        <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك" />
        <label style={styles.label}>رقم الجوال</label>
        <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" />
        <label style={styles.label}>عدد الأشخاص</label>
        <div style={styles.counter}>
          <button style={styles.countBtn} onClick={() => setPartySize(p => Math.max(1, p-1))}>-</button>
          <span style={styles.countNum}>{partySize}</span>
          <button style={styles.countBtn} onClick={() => setPartySize(p => p+1)}>+</button>
        </div>
        <button style={styles.btn} onClick={handleJoin}>انضم لقائمة الانتظار</button>
      </div>
    </div>
  )
}

function StaffPage() {
  return <div><h1>صفحة الموظفين</h1></div>
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: 20 },
  title: { fontSize: 28, marginBottom: 20, color: '#333' },
  card: { background: 'white', borderRadius: 12, padding: 30, width: '100%', maxWidth: 400, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  label: { display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#555' },
  input: { width: '100%', padding: '10px', marginBottom: 16, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, boxSizing: 'border-box' },
  counter: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  countBtn: { width: 36, height: 36, borderRadius: 8, border: 'none', background: '#eee', fontSize: 20, cursor: 'pointer' },
  countNum: { fontSize: 20, fontWeight: 'bold' },
  btn: { width: '100%', padding: '12px', background: '#8B4513', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  success: { color: 'green', fontSize: 22 },
  sub: { color: '#555', marginBottom: 20 }
}