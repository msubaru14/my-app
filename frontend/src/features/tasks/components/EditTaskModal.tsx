import "../../../components/common.css"
import "./EditTaskModal.css"
import { useEffect, useState } from "react"
import { updateTask } from "../api/tasksApi"
import type { Task } from "../types/task"
import { useApiError } from "../../../hooks/useApiError";
import { useNavigate } from "react-router-dom";

type Props = {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onUpdated: () => void
}

type ModalContentProps = {
  onClose: () => void
  task: Task
  onUpdated: () => void
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onUpdated,
}: Props) {
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

  return (
    <EditTaskModalContent
      key={task.id}
      onClose={onClose}
      task={task}
      onUpdated={onUpdated}
    />
  )
}

function EditTaskModalContent({
  onClose,
  task,
  onUpdated,
}: ModalContentProps) {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState<string | null>(task.dueDate);
  const [completed, setCompleted] = useState(task.completed);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const { resolveError } = useApiError();
  const navigate = useNavigate();

  const handleSave = async () => {
    setError("");
    setFieldErrors([]);

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

        case "validation": {
          const messages =
            result.details.length > 0
              ? result.details.map((detail) => detail.message)
              : [result.message];

          setFieldErrors(messages);
          setError("");
          break;
        }

        case "message":
          setError(result.message);
          break;
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">タスク編集</h2>

        <div className="edit-task-modal-form-group">
          <label>タイトル</label>
          <input
            className="edit-task-modal-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="edit-task-modal-form-group">
          <label>期限</label>
          <input
            className="edit-task-modal-input"
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

        {fieldErrors.length > 0 && (
          <ul className="error-list">
            {fieldErrors.map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        )}

        {error && <p className="error-message">{error}</p>}

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
