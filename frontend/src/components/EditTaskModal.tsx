import "./EditTaskModal.css"
import { useEffect, useState } from "react"
import { updateTask } from "../lib/api"
import type { Task } from "../types/task"
import { useApiError } from "../hooks/useApiError";
import { useNavigate } from "react-router-dom";

type Props = {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onUpdated: () => void
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const { resolveError } = useApiError();
  const navigate = useNavigate();

  // 初期値セット
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDueDate(task.dueDate);
      setCompleted(task.completed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose])

  if (!isOpen || !task) return null

  const handleSave = async () => {
    const payload: Task = {
      id: task.id,
      title,
      dueDate: dueDate === "" ? null : dueDate,
      completed,
    }

    try {
      await updateTask(payload);

      onClose();
      await onUpdated();
    } catch (err) {
      const result = resolveError(err);

      switch (result.type) {
        case "redirect":
          navigate(result.to);
          break;

        case "validation":
          break;

        case "message":
          break;
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">タスク編集</h2>

        <div className="form-group">
          <label>タイトル</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>期限</label>
          <input
            className="input"
            type="date"
            value={dueDate ?? ""}
            onChange={(e) => setDueDate(e.target.value || null)}
          />
        </div>

        <div className="checkbox-group">
          <label>ステータス</label>
          <div className="checkbox-row">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            <span>完了</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel" onClick={onClose}>
            キャンセル
          </button>
          <button className="save" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
