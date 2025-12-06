import { formatTimeAgo } from "../lib/utils";

function UserComment({ user, comment, createdAt }: { user: string; comment: string; createdAt?: string }) {
  return (
    <div className="flex gap-3 mt-5 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        {user.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">{user}</span>
          {createdAt && <span className="text-xs text-muted-foreground">{formatTimeAgo(createdAt)}</span>}
        </div>
        <div className="text-sm text-foreground mt-1">{comment}</div>
      </div>
    </div>
  );
}

export default UserComment;
