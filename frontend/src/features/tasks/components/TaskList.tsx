import "../../../components/common.css"
import "./TaskList.css"
import { useState } from "react";
import type { Task } from "../types/task";
import { toggleTaskComplete, deleteTask } from "../api/tasksApi";
import { TaskAdd } from "./TaskAdd";
import EditTaskModal from "./EditTaskModal"
import { TaskListHeader } from "./TaskListHeader";
import { TaskListItem } from "./TaskListItem";
import { Navigate, useNavigate } from "react-router-dom"
import { useApiError } from "../../../hooks/useApiError";
import { filterTodayTasks } from "../utils/taskFilters";
import { useTaskListData } from "../hooks/useTaskListData";

// 今日のタスク一覧
export const TaskList = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { resolveError } = useApiError();
  const navigate = useNavigate();
  const {
    user,
    tasks,
    loadTasks,
    clearUser,
  } = useTaskListData();

  const token = localStorage.getItem("token");

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    window.location.href = "/login";
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="task-wrapper">
      <TaskListHeader user={user} onLogout={handleLogout} />

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
