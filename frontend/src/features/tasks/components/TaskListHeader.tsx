import { LogOut } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  user: User | null;
  onLogout: () => void;
};

export const TaskListHeader = ({
  user,
  onLogout,
}: Props) => {
  return (
    <div className="header">
      <div className="header-top">
        <h1 className="task-list-title">今日のタスク</h1>
        <button
          className="button-with-icon logout"
          onClick={onLogout}
        >
          <LogOut size={14} />
          ログアウト
        </button>
      </div>

      <p className="greeting">こんにちは、{user?.name}さん</p>
    </div>
  );
};
