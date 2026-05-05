import { Pencil, Trash2 } from "lucide-react";
import type { Task } from "../types/task";

type Props = {
  task: Task;
  onToggle: (id: number, current: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
};

export const TaskListItem = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <div className="task-row">
      <div className="task-left">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id, task.completed)}
        />

        <span className="task-title" title={task.title}>
          {task.title}
        </span>
      </div>

      <div className="task-actions">
        <button className="button-with-icon" onClick={() => onEdit(task)}>
          <Pencil size={16} />
          編集
        </button>
        <button className="button-with-icon delete" onClick={() => onDelete(task.id)}>
          <Trash2 size={16} />
          削除
        </button>
      </div>
    </div>
  );
};
