import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../auth/api/authApi";
import { fetchTasks } from "../api/tasksApi";
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

  const clearUser = () => {
    setUser(null);
  };

  return {
    user,
    tasks,
    loadTasks,
    clearUser,
  };
};
