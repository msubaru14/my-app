import {
  requestJson,
  API_BASE_URL,
  getAuthHeaders,
  getJsonHeaders,
} from "../../../lib/api";
import type { Task } from "../types/task";

// GET /tasks
export const fetchTasks = async () => {
  console.log('fetch tasks');
  const json = await requestJson(`${API_BASE_URL}/tasks`, {
    headers: getAuthHeaders(),
  });

  return json.data.tasks;
};

// POST /tasks
export const createTask = async (
  title: string,
  dueDate: string
) => {
  const json = await requestJson(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      ...getJsonHeaders(),
      ...getAuthHeaders(),
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
  const json = await requestJson(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      ...getJsonHeaders(),
      ...getAuthHeaders(),
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
  const json = await requestJson(`${API_BASE_URL}/tasks/${task.id}`, {
    method: "PATCH",
    headers: {
      ...getJsonHeaders(),
      ...getAuthHeaders(),
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
  const json = await requestJson(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return json;
}
