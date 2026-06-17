import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://lcmrdllohmlupdxgtgln.supabase.co',
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
      name, phone, party_size: partySize,
      branch_id: '867b7d6a-8e6d-475b-9ab2-0768977fb5d4'
    })
    if (error) return alert('حدث خطأ: ' + error.message)
    setDone(true)
  }

  if (done) return (
    <div style={styles.center}>
      <h2 style={styles.success}>✓ تم تسجيلك في قائمة الانتظار</h2>
      <p style={styles.sub}>سيتم إرسال رسالة على جوالك عند جاهزية طاولتك</p>
      <button style={styles.btn} onClick={() => setDone(false)}>تسجيل عميل جديد</button>
    </div>
  )

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>قائمة الانتظار</h1>
      <div style={styles.card}>
        <label style={styles.label}>الاسم</label>
        <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسمك" />
        <label style={styles.label}>رقم الجوال</label>
        <input style={styles.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="05xxxxxxxx" />
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
  const [list, setList] = useState([])

  useEffect(() => {
    fetchList()
    const sub = supabase.channel('waitlist').on('postgres_changes',
      { event: '*', schema: 'public', table: 'waitlist' }, fetchList
    ).subscribe()
    return () => sub.unsubscribe()
  }, [])

  async function fetchList() {
    const { data } = await supabase.from('waitlist')
      .select('*').eq('status', 'waiting').order('joined_at')
    setList(data || [])
  }

  async function callCustomer(id) {
    await supabase.from('waitlist').update({ status: 'called', called_at: new Date() }).eq('id', id)
  }

  async function seatCustomer(id) {
    await supabase.from('waitlist').update({ status: 'seated', seated_at: new Date() }).eq('id', id)
  }

  async function cancelCustomer(id) {
    await supabase.from('waitlist').update({ status: 'cancelled' }).eq('id', id)
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>لوحة الموظف</h1>
      <p style={styles.sub}>قائمة الانتظار ({list.length} عميل)</p>
      {list.map(c => (
        <div key={c.id} style={styles.card}>
          <div style={styles.row}>
            <span style={styles.customerName}>{c.name}</span>
            <span style={styles.badge}>{c.party_size} أشخاص</span>
          </div>
          <p style={styles.time}>انتظر منذ: {new Date(c.joined_at).toLocaleTimeString('ar')}</p>
          <div style={styles.row}>
            <button style={styles.btnCall} onClick={() => callCustomer(c.id)}>استدعاء</button>
            <button style={styles.btnSeat} onClick={() => seatCustomer(c.id)}>تم الجلوس</button>
            <button style={styles.btnCancel} onClick={() => cancelCustomer(c.id)}>إلغاء</button>
          </div>
        </div>
      ))}
      {list.length === 0 && <p style={styles.empty}>لا يوجد عملاء في قائمة الانتظار</p>}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '20px', fontFamily: 'Arial', direction: 'rtl' },
  center: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', direction: 'rtl' },
  title: { textAlign: 'center', fontSize: '28px', marginBottom: '20px', color: '#333' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#555' },
  input: { width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '14px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', marginTop: '8px' },
  btnCall: { flex: 1, padding: '10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', margin: '4px' },
  btnSeat: { flex: 1, padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', margin: '4px' },
  btnCancel: { flex: 1, padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', margin: '4px' },
  counter: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px', justifyContent: 'center' },
  countBtn: { width: '44px', height: '44px', fontSize: '24px', borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer', background: 'white' },
  countNum: { fontSize: '24px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' },
  row: { display: 'flex', gap: '8px', alignItems: 'center' },
  customerName: { fontSize: '18px', fontWeight: 'bold', flex: 1 },
  badge: { background: '#f0f0f0', padding: '4px 10px', borderRadius: '20px', fontSize: '14px' },
  time: { color: '#888', fontSize: '13px', margin: '8px 0' },
  success: { fontSize: '24px', color: '#2ecc71' },
  sub: { color: '#888', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: '40px' }
}