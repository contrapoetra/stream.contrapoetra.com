import { formatTimeAgo } from "../lib/utils";
import { Link } from "react-router-dom";

function UserComment({ user, comment, createdAt }: { user: string; comment: string; createdAt?: string }) {
  return (
    <div className="flex gap-3 mt-4 rounded-lg">
      <Link to={`/@${user}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {user.charAt(0).toUpperCase()}
        </div>
      </Link>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <Link to={`/@${user}`} className="hover:underline">
            <span className="text-sm font-bold text-foreground">{user}</span>
          </Link>
          {createdAt && <span className="text-xs text-muted-foreground">{formatTimeAgo(createdAt)}</span>}
        </div>
        <div className="text-sm text-foreground mt-1">{comment}</div>
      </div>
    </div>
  );
}

export default UserComment;
