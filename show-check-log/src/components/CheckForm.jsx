import { useState } from "react"
import { storage } from "../firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function CheckForm({ onAdd, user }) {
  const [form, setForm] = useState({
    startDate: "",
    endDate: ""
  })

  const [note, setNote] = useState("")
const [image, setImage] = useState(null)
const [uploading,setUploading] = useState(false)

const submit = async () => {

  if (!form.startDate || !form.endDate) return

  setUploading(true)

  try {

    let imageUrl = null

    if (image) {
      const storageRef = ref(storage, `checkNotes/${Date.now()}-${image.name}`)
      await uploadBytes(storageRef, image)
      imageUrl = await getDownloadURL(storageRef)
    }

   onAdd({
  id: Date.now(),

  startDate: form.startDate,
  endDate: form.endDate,

  checkedAt: Date.now(),

  // 🔥 NEW (IMPORTANT)
  userId: user.uid,
  userName: user?.displayName || user?.email,

  // 🔁 keep for backward compatibility (optional)
  checkedBy: user?.displayName || user?.email,

  notes: note
    ? [
        {
          id: Date.now(),
          text: note,
          image: imageUrl,
          createdAt: Date.now(),
          author: user?.displayName || user?.email
        }
      ]
    : []
})

    setForm({
      startDate: "",
      endDate: ""
    })

    setNote("")
    setImage(null)

  } finally {
    setUploading(false)
  }

}
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">
          Check Started
        </label>
        <input
          type="date"
          className="input bg-white/10 border-white/10 text-white focus:ring-blue-500"
          value={form.startDate}
          onChange={(e) =>
            setForm({ ...form, startDate: e.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">
          Check Through
        </label>
        <input
          type="date"
          className="input bg-white/10 border-white/10 text-white focus:ring-blue-500"
          value={form.endDate}
          onChange={(e) =>
            setForm({ ...form, endDate: e.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
<label className="text-sm font-medium text-white/80">
Note (optional)
</label>

<textarea
className="input bg-white/10 border-white/10 text-white focus:ring-blue-500"
placeholder="Add note..."
value={note}
onChange={(e)=>setNote(e.target.value)}
/>
</div>

<div className="flex flex-col gap-2 md:col-span-2">
<label className="text-sm font-medium text-white/80">
Screenshot (optional)
</label>

<input
type="file"
accept="image/*"
className="text-white"
onChange={(e)=>setImage(e.target.files[0])}
/>
</div>

     <button
onClick={submit}
disabled={uploading}
className="md:col-span-2 mt-4 rounded-xl py-3 font-semibold text-white
bg-blue-600 hover:bg-blue-700
shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
>
{uploading ? "Uploading..." : "Add Check"}
</button>
    </div>
  )
}
