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
    await fetch('/api/send-sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: phon
  }

  if (done) return (
    <div style={s.successPage}>
      <div style={s.successCard}>
        <div style={s.successIcon}>☕</div>
        <h2 style={s.successTitle}>تم تسجيلك بنجاح!</h2>
        <p style={s.successSub}>سنُعلمك فور جاهزية طاولتك</p>
        <button style={s.btnPrimary} onClick={() => setDone(false)}>تسجيل عميل جديد</button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logo}>☕</div>
        <h1 style={s.headerTitle}>قائمة الانتظار</h1>
        <p style={s.headerSub}>سنُعلمك فور جاهزية طاولتك</p>
      </div>
      <div style={s.formCard}>
        <div style={s.field}>
          <label style={s.label}>الاسم</label>
          <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسمك" />
        </div>
        <div style={s.field}>
          <label style={s.label}>رقم الجوال</label>
          <input style={s.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="05xxxxxxxx" />
        </div>
        <div style={s.field}>
          <label style={s.label}>عدد الأشخاص</label>
          <div style={s.counter}>
            <button style={s.countBtn} onClick={() => setPartySize(p => Math.max(1, p - 1))}>−</button>
            <span style={s.countNum}>{partySize}</span>
            <button style={s.countBtn} onClick={() => setPartySize(p => p + 1)}>+</button>
          </div>
        </div>
        <button style={s.btnPrimary} onClick={handleJoin}>انضم لقائمة الانتظار</button>
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
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logo}>☕</div>
        <h1 style={s.headerTitle}>لوحة الموظف</h1>
        <p style={s.headerSub}>{list.length} عميل في الانتظار</p>
      </div>
      <div style={s.listContainer}>
        {list.length === 0 && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🎉</div>
            <p style={s.emptyText}>لا يوجد عملاء في قائمة الانتظار</p>
          </div>
        )}
        {list.map((c, i) => (
          <div key={c.id} style={s.customerCard}>
            <div style={s.cardTop}>
              <div style={s.numberBadge}>{i + 1}</div>
              <div style={s.customerInfo}>
                <span style={s.customerName}>{c.name}</span>
                <span style={s.customerTime}>انتظر منذ: {new Date(c.joined_at).toLocaleTimeString('ar')}</span>
              </div>
              <div style={s.partyBadge}>
                <span style={s.partyNum}>{c.party_size}</span>
                <span style={s.partyLabel}>أشخاص</span>
              </div>
            </div>
            <div style={s.cardActions}>
              <button style={s.btnCall} onClick={() => callCustomer(c.id)}>📢 استدعاء</button>
              <button style={s.btnSeat} onClick={() => seatCustomer(c.id)}>✓ تم الجلوس</button>
              <button style={s.btnCancel} onClick={() => cancelCustomer(c.id)}>✕ إلغاء</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg, #fdf6f0 0%, #fef9f5 100%)', fontFamily: "'Segoe UI', Arial, sans-serif", direction: 'rtl', paddingBottom: '40px' },
  header: { background: 'white', padding: '32px 24px 28px', textAlign: 'center', borderBottom: '1px solid #f0e8e0', marginBottom: '24px', boxShadow: '0 2px 12px rgba(180,130,90,0.07)' },
  logo: { fontSize: '42px', marginBottom: '8px' },
  headerTitle: { fontSize: '26px', fontWeight: '700', color: '#3d2314', margin: '0 0 6px' },
  headerSub: { fontSize: '14px', color: '#b08060', margin: 0 },
  formCard: { background: 'white', borderRadius: '20px', padding: '28px 24px', margin: '0 16px', boxShadow: '0 4px 24px rgba(180,130,90,0.10)', border: '1px solid #f5ece4' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#6b4c35', marginBottom: '8px' },
  input: { width: '100%', padding: '14px 16px', fontSize: '16px', borderRadius: '12px', border: '1.5px solid #edddd0', background: '#fdf9f6', boxSizing: 'border-box', color: '#3d2314', outline: 'none' },
  counter: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '12px 0' },
  countBtn: { width: '44px', height: '44px', fontSize: '22px', borderRadius: '50%', border: '1.5px solid #edddd0', background: '#fdf6f0', color: '#b08060', cursor: 'pointer', fontWeight: '600' },
  countNum: { fontSize: '26px', fontWeight: '700', color: '#3d2314', minWidth: '40px', textAlign: 'center' },
  btnPrimary: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #c8845a 0%, #a0623c 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 16px rgba(160,98,60,0.30)' },
  successPage: { minHeight: '100vh', background: 'linear-gradient(160deg, #fdf6f0 0%, #fef9f5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', padding: '24px' },
  successCard: { background: 'white', borderRadius: '24px', padding: '40px 32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(180,130,90,0.14)', width: '100%', maxWidth: '360px' },
  successIcon: { fontSize: '56px', marginBottom: '16px' },
  successTitle: { fontSize: '22px', fontWeight: '700', color: '#3d2314', margin: '0 0 10px' },
  successSub: { fontSize: '14px', color: '#b08060', marginBottom: '28px' },
  listContainer: { padding: '0 16px' },
  customerCard: { background: 'white', borderRadius: '18px', padding: '18px 20px', marginBottom: '14px', boxShadow: '0 2px 16px rgba(180,130,90,0.09)', border: '1px solid #f5ece4' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' },
  numberBadge: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #c8845a, #a0623c)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '15px', flexShrink: 0 },
  customerInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' },
  customerName: { fontSize: '17px', fontWeight: '700', color: '#3d2314' },
  customerTime: { fontSize: '12px', color: '#b08060' },
  partyBadge: { background: '#fdf6f0', border: '1px solid #edddd0', borderRadius: '12px', padding: '6px 12px', textAlign: 'center', flexShrink: 0 },
  partyNum: { display: 'block', fontSize: '18px', fontWeight: '700', color: '#c8845a', lineHeight: 1 },
  partyLabel: { fontSize: '10px', color: '#b08060' },
  cardActions: { display: 'flex', gap: '8px' },
  btnCall: { flex: 1, padding: '10px 6px', background: '#eef4ff', color: '#3a6fd8', border: '1px solid #d0e0ff', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  btnSeat: { flex: 1, padding: '10px 6px', background: '#edfaf3', color: '#27a85f', border: '1px solid #c0ecd4', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  btnCancel: { flex: 1, padding: '10px 6px', background: '#fff0f0', color: '#d93535', border: '1px solid #ffd0d0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyText: { color: '#c0a090', fontSize: '15px' },
}