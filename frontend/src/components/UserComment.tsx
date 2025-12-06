import { formatTimeAgo } from "../lib/utils";

function UserComment({ user, comment, createdAt }: { user: string; comment: string; createdAt?: string }) {
  return (
    <div className="flex flex-col p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <img src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${user}&hair=short01,short02,short03,short04,short05`} alt={user} className="w-8 h-8 rounded-full" />
        <span className="text-sm font-bold text-foreground">{user}</span>
        {createdAt && <span className="text-xs text-muted-foreground">{formatTimeAgo(createdAt)}</span>}
      </div>
      <div className="text-sm text-foreground pl-10">{comment}</div>
    </div>
  );
}

export default UserComment;
