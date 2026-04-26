import type { Task } from "../types/task";

export class ApiError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

// POST /users
export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  console.log('create user');
  const res = await fetch("http://localhost:8080/users", {
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

  const json = await res.json();

  if (json.error) {
    throw new ApiError(json.error.code);
  }

  return json.data.user;
};

// GET /me
export const getMe = async (token: string) => {
  console.log('get me');
  const res = await fetch("http://localhost:8080/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (json.error) {
    throw new ApiError(json.error.code);
  }

  return json.data.user;
}

// GET /tasks
export const fetchTasks = async (token: string) => {
  console.log('fetch tasks');
  const res = await fetch("http://localhost:8080/tasks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (json.error) {
    throw new ApiError(json.error.code);
  }

  return json.data.tasks;
};

// POST /tasks
export const createTask = async (
  token: string,
  title: string,
  dueDate: string
) => {
  const res = await fetch("http://localhost:8080/tasks", {
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

  const json = await res.json();

  if (json.error) {
    throw new ApiError(json.error.code);
  }

  return json.data.task;
}

// PATCH /tasks/:id (完了チェック)
export const toggleTaskComplete = async (
  id: number,
  current: boolean,
  token: string
) => {
  const res = await fetch(`http://localhost:8080/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      completed: !current,
    }),
  });

  const json = await res.json();

  if (json.error) {
    throw new ApiError(json.error.code);
  }

  return json.data.task;
}

// PATCH /tasks/:id (タスク編集)
export const updateTask = async (
  task: Task,
  token: string
) => {
  const res = await fetch(`http://localhost:8080/tasks/${task.id}`, {
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

  const json = await res.json();

  if (json.error) {
    throw new ApiError(json.error.code);
  }

  return json.data.task;
}

// DELETE /tasks/:id
export const deleteTask = async (id: number, token: string) => {
  const res = await fetch(`http://localhost:8080/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("削除に失敗しました")
  }

  return res.json()
}