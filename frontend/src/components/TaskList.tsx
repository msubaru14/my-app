import { useEffect, useState, useCallback } from "react";
import type { Task } from "../types/task";
import { fetchTasks } from "../lib/api";
import { TaskAdd } from "./TaskAdd";

type Props = {
  token: string;
};

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// 今日のタスク一覧
export const TaskList = ({ token }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(() => {
    fetchTasks(token).then(setTasks).catch(console.error);
  }, [token]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const todayStr = getTodayString();

  const todayTasks = tasks.filter(
    (task) => task.dueDate === todayStr
  );

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>今日のタスク</h2>
      <ul>
        {todayTasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>

      {/* タスク追加 */}
      <TaskAdd token={token} onTaskAdded={loadTasks} />
    </div>
  );
};
