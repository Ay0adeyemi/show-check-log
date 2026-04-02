
import { useEffect, useState } from "react"
import { db } from "../firebase"
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore"
import { X, ChevronDown, Plus, Trash2, Tag } from "lucide-react"
import ConfirmModal from "../components/ConfirmModal"

export default function PromoDrawer({ open, onClose, user }) {
  const [promoShows, setPromoShows] = useState([])
  const [openShowId, setOpenShowId] = useState(null)
const [confirmDeleteShow,setConfirmDeleteShow] = useState(null)
  const [showAddShow, setShowAddShow] = useState(false)
  const [newShowName, setNewShowName] = useState("")

  const [showAddCodeFor, setShowAddCodeFor] = useState(null) // {id, name}
  const [codeForm, setCodeForm] = useState({ code: "", platform: "", note: "" })

  // Load promo shows only when drawer is open (saves reads)
  useEffect(() => {
    if (!open) return

    const unsub = onSnapshot(collection(db, "promoShows"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

      // alphabetical show names
      data.sort((a, b) =>
        (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase())
      )

      setPromoShows(data)
    })

    return () => unsub()
  }, [open])

  const toggleShow = (id) => {
    setOpenShowId((prev) => (prev === id ? null : id))
  }

  const addPromoShow = async (e) => {
    e.preventDefault()
    const name = newShowName.trim()
    if (!name) return

    await addDoc(collection(db, "promoShows"), {
      name,
      createdAt: Date.now(),
      createdBy: user?.uid || null
    })

    setNewShowName("")
    setShowAddShow(false)
  }

  const addPromoCode = async (e) => {
    e.preventDefault()
    if (!showAddCodeFor) return

    const code = codeForm.code.trim()
    if (!code) return

    await addDoc(collection(db, "promoShows", showAddCodeFor.id, "codes"), {
      code,
      platform: codeForm.platform.trim(),
      note: codeForm.note.trim(),
      createdAt: Date.now(),
      createdBy: user?.uid || null
    })

    setCodeForm({ code: "", platform: "", note: "" })
    setShowAddCodeFor(null)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 transition ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] md:w-[460px]
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="h-full bg-[#0b1220]/80 border-l border-white/10 backdrop-blur-xl text-white shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-white/80" />
              <h2 className="font-bold text-lg">Promo Codes</h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto h-[calc(100%-70px)]">
            {/* Add show */}
            <button
              onClick={() => setShowAddShow(true)}
              className="w-full rounded-2xl px-4 py-3 font-semibold
              bg-white/10 border border-white/10 backdrop-blur-xl
              hover:bg-white/15 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Promo Show
            </button>

            {showAddShow && (
              <form
                onSubmit={addPromoShow}
                className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
              >
                <input
                  value={newShowName}
                  onChange={(e) => setNewShowName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-blue-500/60"
                  placeholder="Show name (e.g. Wicked)"
                  autoFocus
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddShow(false)
                      setNewShowName("")
                    }}
                    className="flex-1 rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl px-3 py-2 bg-blue-600/90 hover:bg-blue-600 transition font-semibold"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Shows list */}
            <div className="mt-6 space-y-4">
              {promoShows.length === 0 ? (
                <p className="text-white/60 text-sm text-center mt-8">
                  No promo shows yet.
                </p>
              ) : (
                promoShows.map((show) => (
                  <PromoShowItem
key={show.id}
show={show}
isOpen={openShowId === show.id}
onToggle={() => toggleShow(show.id)}
onAddCode={() => setShowAddCodeFor({ id: show.id, name: show.name })}
onCloseAddCode={() => setShowAddCodeFor(null)}
showAddCodeFor={showAddCodeFor}
codeForm={codeForm}
setCodeForm={setCodeForm}
addPromoCode={addPromoCode}
onDeleteShow={() => setConfirmDeleteShow(show)}
/>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>
      {confirmDeleteShow && (
<ConfirmModal
title="Delete Promo Show"
message={`Delete "${confirmDeleteShow.name}" and all its promo codes?`}
confirmText="Delete"
onCancel={()=>setConfirmDeleteShow(null)}
onConfirm={async ()=>{

try{

const codesRef = collection(db,"promoShows",confirmDeleteShow.id,"codes")
const codesSnap = await getDocs(codesRef)

await Promise.all(
codesSnap.docs.map(d =>
deleteDoc(doc(db,"promoShows",confirmDeleteShow.id,"codes",d.id))
)
)

await deleteDoc(doc(db,"promoShows",confirmDeleteShow.id))

}catch(err){
console.error(err)
}

setConfirmDeleteShow(null)

}}
/>
)}
    </>
  )
}

function PromoShowItem({
  show,
  isOpen,
  onToggle,
  onAddCode,
  showAddCodeFor,
  onCloseAddCode,
  codeForm,
  setCodeForm,
  addPromoCode,
  onDeleteShow
}) {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    const unsub = onSnapshot(
      collection(db, "promoShows", show.id, "codes"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        // newest first
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setCodes(data)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [isOpen, show.id])

  const deleteCode = async (codeId) => {
    await deleteDoc(doc(db, "promoShows", show.id, "codes", codeId))
  }

  const deleteShow = async () => {

  const confirmDelete = window.confirm(
    `Delete "${show.name}" and all its promo codes?`
  )

  if (!confirmDelete) return

  try {

    const codesRef = collection(db, "promoShows", show.id, "codes")
    const codesSnap = await getDocs(codesRef)

    const deletes = codesSnap.docs.map(d =>
      deleteDoc(doc(db, "promoShows", show.id, "codes", d.id))
    )

    await Promise.all(deletes)

    await deleteDoc(doc(db, "promoShows", show.id))

  } catch (err) {
    console.error("Failed to delete show:", err)
  }

}

  const addingHere = showAddCodeFor?.id === show.id

  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
      <button
onClick={onToggle}
className="w-full px-4 py-3"
>

<div className="flex items-center justify-between w-full">

<div className="flex items-center gap-2 min-w-0">

<ChevronDown
className={`w-5 h-5 text-white/80 transition-transform ${
isOpen ? "rotate-180" : ""
}`}
/>

<span className="font-semibold text-white truncate">
{show.name}
</span>

</div>

<div className="flex items-center gap-2">

{codes.length > 0 && (
<span className="text-xs text-white/60">
{codes.length} code(s)
</span>
)}

<button
onClick={(e)=>{
  e.stopPropagation()
  onDeleteShow()
}}
className="p-1.5 rounded-lg hover:bg-red-500/20 transition"
title="Delete entire show"
>
<Trash2 className="w-4 h-4 text-red-400" />
</button>

</div>

</div>

</button>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-4">
          <button
            onClick={onAddCode}
            className="w-full mt-2 rounded-xl px-3 py-2 font-semibold
              bg-blue-600/90 hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Code
          </button>

          {addingHere && (
            <form
              onSubmit={addPromoCode}
              className="mt-3 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
            >
              <input
                value={codeForm.code}
                onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value })}
                className="w-full rounded-xl px-3 py-2 bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-blue-500/60"
                placeholder="Promo code (e.g. WICKED20)"
                autoFocus
              />

              <input
                value={codeForm.platform}
                onChange={(e) => setCodeForm({ ...codeForm, platform: e.target.value })}
                className="w-full rounded-xl px-3 py-2 bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-blue-500/60"
                placeholder="Platform (optional)"
              />

              <textarea
                value={codeForm.note}
                onChange={(e) => setCodeForm({ ...codeForm, note: e.target.value })}
                className="w-full rounded-xl px-3 py-2 bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-blue-500/60"
                placeholder="Note (optional)"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCloseAddCode}
                  className="flex-1 rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl px-3 py-2 bg-blue-600/90 hover:bg-blue-600 transition font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 space-y-3">
            {loading ? (
              <>
                <div className="h-14 bg-white/10 border border-white/10 rounded-xl animate-pulse" />
                <div className="h-14 bg-white/10 border border-white/10 rounded-xl animate-pulse" />
              </>
            ) : codes.length === 0 ? (
              <p className="text-white/60 text-sm">No promo codes yet.</p>
            ) : (
              codes.map((c) => (
                <div
                  key={c.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white">{c.code}</div>
                    {(c.platform || c.note) && (
                      <div className="text-white/70 text-sm mt-1">
                        {c.platform && <span className="mr-2">{c.platform}</span>}
                        {c.note && <span>• {c.note}</span>}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteCode(c.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                    title="Delete code"
                  >
                    <Trash2 className="h-5 w-5 text-red-300" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
