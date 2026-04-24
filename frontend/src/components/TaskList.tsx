import { useEffect, useState, useCallback } from "react";
import type { Task } from "../types/task";
import { fetchTasks, toggleTaskComplete, deleteTask } from "../lib/api";
import { TaskAdd } from "./TaskAdd";
import EditTaskModal from "./EditTaskModal"

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
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const loadTasks = useCallback(() => {
    fetchTasks(token).then(setTasks).catch(console.error);
  }, [token]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggle = async (id: number, current: boolean) => {
    try {
      await toggleTaskComplete(id, current, token);
      await loadTasks(); // 再フェッチ
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("このタスクを削除しますか？")

    if (!confirmed) return

    try {
      await deleteTask(id, token)
      await loadTasks()
    } catch (e) {
      console.error(e)
      alert("削除に失敗しました")
    }
  }

  const todayStr = getTodayString();

  const todayTasks = tasks.filter(
    (task) => task.dueDate === todayStr
  );

  const openModal = (task: Task) => {
    setSelectedTask(task)
    setIsOpen(true)
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>今日のタスク</h2>
      <ul>
        {todayTasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task.id, task.completed)}
            />
            {task.title}

            <button onClick={() => openModal(task)}>編集</button>
            <button onClick={() => handleDelete(task.id)}>削除</button>
          </li>
        ))}
      </ul>

      {/* タスク追加 */}
      <TaskAdd token={token} onTaskAdded={loadTasks} />

      <EditTaskModal
        token={token}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        task={selectedTask}
        onUpdated={loadTasks}
      />
    </div>
  );
};
