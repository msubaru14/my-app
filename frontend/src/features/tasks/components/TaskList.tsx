import "../../../components/common.css"
import "./TaskList.css"
import { useState } from "react";
import type { Task } from "../types/task";
import { TaskAdd } from "./TaskAdd";
import EditTaskModal from "./EditTaskModal"
import { TaskListHeader } from "./TaskListHeader";
import { TaskListItem } from "./TaskListItem";
import { Navigate } from "react-router-dom"
import { filterTodayTasks } from "../utils/taskFilters";
import { useTaskListData } from "../hooks/useTaskListData";

// 今日のタスク一覧
export const TaskList = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const {
    user,
    tasks,
    loadTasks,
    clearUser,
    toggleCompletion,
    removeTask,
  } = useTaskListData();

  const token = localStorage.getItem("token");

  const handleDelete = async (task: Task) => {
    const confirmed = window.confirm("このタスクを削除しますか？");

    if (!confirmed) return;

    await removeTask(task);
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
              onToggle={toggleCompletion}
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
