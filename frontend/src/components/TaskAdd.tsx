import "./TaskList.css"
import { useState } from "react";
import { createTask } from "../lib/api";
import { ApiError } from "../lib/errors";

type Props = {
  token: string;
  onTaskAdded: () => void;
};

// タスク追加
export const TaskAdd = ({ token, onTaskAdded }: Props) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleTaskAdd = async () => {
    if (!title.trim()) {
      alert("タスク名を入力してください");
      return
    }

    // タスク追加API
    try {
      await createTask(token, title, dueDate);

      setTitle("");
      setDueDate("");

      onTaskAdded();
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof ApiError) {
        if (e.message === "VALIDATION_ERROR") {
          alert("入力内容に問題があります");
          return;
        }

        if (e.message === "UNAUTHORIZED") {
          alert("ログインが必要です");
          return;
        }
      }

      alert("タスク追加失敗");
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
