const Loading = () => {
  return (
    <div className="flex flex-1 flex-col flex-grow justify-center items-center w-full h-full">
      <div className="animate-spin inline-block w-16 h-16 border-4 border-t-4 border-gray-300 rounded-full border-t-blue-600"></div>
      <p>Loading...</p>
    </div>
  );
};

export default Loading
