function UserComment({ user, comment }: { user: string; comment: string }) {
  return (
    <div className="flex flex-col mb-5">
      <div className="flex items-center">
        <img src={`https://avatars.dicebear.com/api/avataaars/${user}.svg`} alt={user} className="w-8 h-8 rounded-full mr-2" />
        <span className="text-sm font-bold">{user}</span>
      </div>
      <div className="ml-10 text-sm">{comment}</div>
    </div>
  );
}

export default UserComment;
