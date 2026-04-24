import { useEffect, useState } from "react"
import { updateTask } from "../lib/api"
import type { Task } from "../types/task"

type Props = {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onUpdated: () => void
  token: string;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onUpdated,
  token
}: Props) {
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  // 初期値セット
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title)
      setDueDate(task.dueDate)
      setCompleted(task.completed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task])

  if (!isOpen || !task) return null

  const handleSave = async () => {
    const payload: Task = {
      id: task.id,
      title,
      dueDate: dueDate === "" ? null : dueDate,
      completed,
    }

    await updateTask(payload, token)

    onClose()
    await onUpdated()
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>タスク編集</h2>

        <div>
          <label>タイトル</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label>期限</label>
          <input
            type="date"
            value={dueDate ?? ""}
            onChange={(e) => setDueDate(e.target.value || null)}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            完了
          </label>
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={handleSave}>保存</button>
          <button onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  )
}

// 簡易スタイル
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const modalStyle: React.CSSProperties = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 300,
}
