import { useState } from "react";
import { createTask, ApiError } from "../lib/api";

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
    <>
      <input
        placeholder="タスク名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <button onClick={handleTaskAdd}>追加</button>
    </>
  );
};
