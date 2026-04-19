export class ApiError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

// GET /tasks
export const fetchTasks = async (token: string) => {
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
