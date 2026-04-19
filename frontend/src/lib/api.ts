// GET /tasks
export const fetchTasks = async (token: string) => {
  const res = await fetch("http://localhost:8080/tasks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (json.error) {
    throw new Error(json.error.code);
  }

  return json.data.tasks;
};

// POST /tasks
export const createTask = async (token: string, title: string, dueDate: string) => {
  const res = await fetch("http://localhost:8080/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      dueDate,
    }),
  });

  if (!res.ok) throw new Error("failed to create tasks");
}
