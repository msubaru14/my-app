import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../auth/api/authApi";
import { deleteTask, fetchTasks, toggleTaskComplete } from "../api/tasksApi";
import type { Task } from "../types/task";
import { useApiError } from "../../../hooks/useApiError";

type User = {
  id: number;
  name: string;
  email: string;
};

export const useTaskListData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const { resolveError } = useApiError();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const reloadTasks = useCallback(async () => {
    if (!token) return;

    try {
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

  const loadInitialData = useCallback(async () => {
    if (!token) return;

    try {
      const me = await getMe();
      setUser(me);

      await reloadTasks();
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
  }, [navigate, reloadTasks, resolveError, token]);

  useEffect(() => {
    void Promise.resolve().then(loadInitialData);
  }, [loadInitialData]);

  const clearUser = () => {
    setUser(null);
  };

  const toggleCompletion = async (task: Task) => {
    try {
      await toggleTaskComplete(task.id, task.completed);
      await reloadTasks();
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

  const removeTask = async (task: Task) => {
    try {
      await deleteTask(task.id);
      await reloadTasks();
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

  return {
    user,
    tasks,
    reloadTasks,
    clearUser,
    toggleCompletion,
    removeTask,
  };
};
