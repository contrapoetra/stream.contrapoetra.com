function UserComment({ user, comment }: { user: string; comment: string }) {
  return (
    <div className="flex flex-col mb-5">
      <div className="flex items-center">
        <img src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${user}&hair=short01,short02,short03,short04,short05`} alt={user} className="w-8 h-8 rounded-full mr-2" />
        <span className="text-sm font-bold">{user}</span>
      </div>
      <div className="ml-10 text-sm">{comment}</div>
    </div>
  );
}

export default UserComment;
