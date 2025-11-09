function Home() {

  return (
    <>
      <div className="bg-gray-950 flex w-full h-full">
        <div id="sidebar" className="bg-gray-900 w-1/5 h-full text-2xl">
          sidebar
        </div>
        <div id="content" className="bg-gray-950 w-full h-full grid gap-3">
          <div className="bg-gray-300 w-full h-full">content</div>
          <div className="bg-gray-300 w-full h-full">content</div>
          <div className="bg-gray-300 w-full h-full">content</div>
          <div className="bg-gray-300 w-full h-full">content</div>
        </div>
      </div>
    </>
  )
}

export default Home;
