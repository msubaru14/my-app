import type { Task } from "../types/task";

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const filterTodayTasks = (tasks: Task[]) => {
  const todayStr = getTodayString();

  return tasks.filter(
    (task) => task.dueDate === todayStr
  );
};
