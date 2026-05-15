import "./TaskList.css";
import { useState } from "react";
import type { Task } from "../types/task";
import { TaskAdd } from "./TaskAdd";
import { EditTaskModal } from "./EditTaskModal";
import { TaskListHeader } from "./TaskListHeader";
import { TaskListItem } from "./TaskListItem";
import { Navigate, useNavigate } from "react-router-dom";
import { filterTodayTasks } from "../utils/taskFilters";
import { useTaskListData } from "../hooks/useTaskListData";
import type { ApiErrorResult } from "../../../hooks/useApiError";

// 今日のタスク一覧
export const TaskList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const navigate = useNavigate();
  const {
    user,
    tasks,
    reloadTasks,
    clearUser,
    toggleCompletion,
    removeTask,
  } = useTaskListData();

  const token = localStorage.getItem("token");

  const handleTaskActionError = (error: ApiErrorResult) => {
    switch (error.type) {
      case "redirect":
        navigate(error.to);
        break;
      case "validation":
        alert(error.message);
        break;
      case "message":
        alert(error.message);
        break;
    }
  };

  const handleToggle = async (task: Task) => {
    const result = await toggleCompletion(task);

    if (!result.ok) {
      handleTaskActionError(result.error);
    }
  };

  const handleDelete = async (task: Task) => {
    const confirmed = window.confirm("このタスクを削除しますか？");

    if (!confirmed) return;

    const result = await removeTask(task);

    if (!result.ok) {
      handleTaskActionError(result.error);
    }
  };

  const todayTasks = filterTodayTasks(tasks);

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setIsOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    navigate("/login");
  };

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

        <TaskAdd onTaskAdded={reloadTasks} />

        <EditTaskModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          task={selectedTask}
          onUpdated={reloadTasks}
        />
      </div>
    </div>
  );
};
