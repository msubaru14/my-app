import { useState } from "react";
import { createTask } from "../lib/api";

type Props = {
  token: string;
  onTaskAdded: () => void;
};

// タスク追加
export const TaskAdd = ({ token, onTaskAdded }: Props) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleTaskAdd = async () => {
    if (!title) {
      alert("タスク名を入力してください");
      return
    }

    // タスク追加API
    try {
      await createTask(token, title, dueDate);
      onTaskAdded();

      setTitle("");
      setDueDate("");
    } catch (e) {
      console.error(e);
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
