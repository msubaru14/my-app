import "../../../components/TaskList.css"
import { useState } from "react";
import { createTask } from "../../../lib/api";
import { useApiError } from "../../../hooks/useApiError";
import { useNavigate } from "react-router-dom";

type Props = {
  onTaskAdded: () => void;
};

// タスク追加
export const TaskAdd = ({ onTaskAdded }: Props) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const { resolveError } = useApiError();
  const navigate = useNavigate();

  const handleTaskAdd = async () => {
    if (!title.trim()) {
      alert("タスク名を入力してください");
      return
    }

    // タスク追加API
    try {
      await createTask(title, dueDate);

      setTitle("");
      setDueDate("");

      onTaskAdded();
    } catch (err) {
      const result = resolveError(err);

      switch (result.type) {
        case "redirect":
          navigate(result.to);
          break;

        case "validation":
          alert("入力内容に問題があります");
          break;

        case "message":
          alert("タスク追加失敗");
          break;
      }
    }
  };

  return (
    <div className="task-add">
      <h3 style={{marginTop: 0}}>タスク追加</h3>

      <input
        className="input"
        placeholder="タスク名を入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="input"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <button className="add-button" onClick={handleTaskAdd}>
        追加
      </button>
    </div>
  );
};
