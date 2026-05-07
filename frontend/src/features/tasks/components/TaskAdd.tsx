import "../../../components/common.css";
import "./TaskList.css";
import { useState } from "react";
import { createTask } from "../api/tasksApi";
import { useApiError } from "../../../hooks/useApiError";
import { useNavigate } from "react-router-dom";

type Props = {
  onTaskAdded: () => void;
};

// タスク追加
export const TaskAdd = ({ onTaskAdded }: Props) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const { resolveError } = useApiError();
  const navigate = useNavigate();

  const handleTaskAdd = async () => {
    setError("");
    setFieldErrors([]);

    if (!title.trim()) {
      setFieldErrors(["タスク名を入力してください"]);
      return;
    }

    // タスク追加API
    try {
      await createTask(title, dueDate);

      setTitle("");
      setDueDate("");
      setError("");
      setFieldErrors([]);

      onTaskAdded();
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
  };

  return (
    <div className="task-add">
      <h3 className="task-add-title">タスク追加</h3>

      <input
        className="task-input"
        placeholder="タスク名を入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="task-input"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <button className="add-button" onClick={handleTaskAdd}>
        追加
      </button>

      {fieldErrors.length > 0 && (
        <ul className="error-list">
          {fieldErrors.map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
        </ul>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};
