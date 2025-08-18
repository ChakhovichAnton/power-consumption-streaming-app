import Chart from "./components/Chart";

const App = () => {
  return (
    <div className="flex flex-col bg-gray-100 max-w-7xl mx-auto pt-12 pb-2 px-1 sm:px-2 min-h-screen">
      <h1 className="text-4xl font-semibold mb-2">Power Consumption App</h1>
      <Chart />
    </div>
  );
};

export default App;
