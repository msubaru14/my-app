import type { Task } from "../features/tasks/types/task";
import { ERROR_CODES } from "../constants/errorCodes";
import type { ErrorCode } from "../constants/errorCodes";
import { CLIENT_ERROR_CODES, ApiError } from "./errors";

const isErrorCode = (value: unknown): value is ErrorCode => {
  return (
    typeof value === "string" &&
    Object.values(ERROR_CODES).includes(value as ErrorCode)
  );
};

const parseJsonOrThrow = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, "Invalid response format");
  }
};

const requestJson = async (url: string, init?: RequestInit) => {
  let res: Response;

  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError(CLIENT_ERROR_CODES.NETWORK_ERROR, "Network error");
  }

  const json = await parseJsonOrThrow(res);

  if (json?.error) {
    const code = isErrorCode(json.error.code)
      ? json.error.code
      : ERROR_CODES.INTERNAL_ERROR;
    const message =
      typeof json.error.message === "string" ? json.error.message : code;

    throw new ApiError(code, message, json.error.details);
  }

  if (!res.ok) {
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, "Request failed");
  }

  return json;
};

// POST /users
export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  console.log('create user');
  const json = await requestJson("http://localhost:8080/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password
    }),
  });

  return json.data.user;
};

// POST /login
export const login = async (
  email: string,
  password: string
) => {
  const json = await requestJson("http://localhost:8080/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return json.data;
};

// GET /me
export const getMe = async () => {
  const token = localStorage.getItem("token");

  console.log('get me');
  const json = await requestJson("http://localhost:8080/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return json.data.user;
}

// GET /tasks
export const fetchTasks = async () => {
  const token = localStorage.getItem("token");

  console.log('fetch tasks');
  const json = await requestJson("http://localhost:8080/tasks", {
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
  const token = localStorage.getItem("token");

  const json = await requestJson("http://localhost:8080/tasks", {
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
  const token = localStorage.getItem("token");

  const json = await requestJson(`http://localhost:8080/tasks/${id}`, {
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
  const token = localStorage.getItem("token");

  const json = await requestJson(`http://localhost:8080/tasks/${task.id}`, {
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
  const token = localStorage.getItem("token");

  const json = await requestJson(`http://localhost:8080/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return json;
}