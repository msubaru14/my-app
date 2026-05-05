import "../../../components/common.css"
import "./TaskList.css"
import { LogOut } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import type { Task } from "../types/task";
import { getMe } from "../../auth/api/authApi";
import { fetchTasks, toggleTaskComplete, deleteTask } from "../api/tasksApi";
import { TaskAdd } from "./TaskAdd";
import EditTaskModal from "./EditTaskModal"
import { TaskListItem } from "./TaskListItem";
import { Navigate, useNavigate } from "react-router-dom"
import { useApiError } from "../../../hooks/useApiError";
import { filterTodayTasks } from "../utils/taskFilters";

type User = {
  id: number;
  name: string;
  email: string;
};

// 今日のタスク一覧
export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [user, setUser] = useState<User | null>(null);
  const { resolveError } = useApiError();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const loadTasks = useCallback(async () => {
    if (!token) return;

    try {
      const me = await getMe();
      setUser(me);

      const tasks = await fetchTasks();
      setTasks(tasks);
    } catch (err) {
      const result = resolveError(err);

      switch (result.type) {
        case "redirect":
          navigate(result.to);
          break;
        case "message":
          console.error(result.message);
          break;
        case "validation":
          console.error(result.message);
          break;
      }
    }
  }, [navigate, resolveError, token]);

  useEffect(() => {
    void Promise.resolve().then(loadTasks);
  }, [loadTasks]);

  const handleToggle = async (id: number, current: boolean) => {
    try {
      await toggleTaskComplete(id, current);
      await loadTasks();
    } catch (err) {
      const result = resolveError(err);

      switch (result.type) {
        case "redirect":
          navigate(result.to);
          break;
        case "validation":
          alert(result.message);
          break;
        case "message":
          alert(result.message);
          break;
      }
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("このタスクを削除しますか？");

    if (!confirmed) return;

    try {
      await deleteTask(id);
      await loadTasks();
    } catch (err) {
      const result = resolveError(err);

      switch (result.type) {
        case "redirect":
          navigate(result.to);
          break;
        case "validation":
          alert(result.message);
          break;
        case "message":
          alert(result.message);
          break;
      }
    }
  }

  const todayTasks = filterTodayTasks(tasks);

  const openModal = (task: Task) => {
    setSelectedTask(task)
    setIsOpen(true)
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="task-wrapper">
      <div className="header">
        <div className="header-top">
          <h1>今日のタスク</h1>
          <button 
            className="button-with-icon logout"
            onClick={() => {
              localStorage.removeItem("token");
              setUser(null);
              window.location.href = "/login";
            }}
          >
            <LogOut size={14} />
            ログアウト
          </button>
        </div>
        
        <p className="greeting">こんにちは、{user?.name}さん</p>
      </div>

      <div className="task-container">
        <div className="task-list">
          {todayTasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={openModal}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <TaskAdd onTaskAdded={loadTasks} />

        <EditTaskModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          task={selectedTask}
          onUpdated={loadTasks}
        />
      </div>
    </div>
  );
};
