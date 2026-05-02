import { requestJson, API_BASE_URL, getToken } from "../../../lib/api";
import type { Task } from "../types/task";

// GET /tasks
export const fetchTasks = async () => {
  const token = getToken();

  console.log('fetch tasks');
  const json = await requestJson(`${API_BASE_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return json.data.tasks;
};

// POST /tasks
export const createTask = async (
  title: string,
  dueDate: string
) => {
  const token = getToken();

  const json = await requestJson(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      dueDate: dueDate || null,
    }),
  });

  return json.data.task;
}

// PATCH /tasks/:id (完了チェック)
export const toggleTaskComplete = async (
  id: number,
  current: boolean,
) => {
  const token = getToken();

  const json = await requestJson(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      completed: !current,
    }),
  });

  return json.data.task;
}

// PATCH /tasks/:id (タスク編集)
export const updateTask = async (
  task: Task,
) => {
  const token = getToken();

  const json = await requestJson(`${API_BASE_URL}/tasks/${task.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: task.title,
      dueDate: task.dueDate,
      completed: task.completed,
    }),
  });

  return json.data.task;
}

// DELETE /tasks/:id
export const deleteTask = async (id: number) => {
  const token = getToken();

  const json = await requestJson(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return json;
}
