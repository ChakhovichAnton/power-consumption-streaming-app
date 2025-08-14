import Chart from "./components/Chart";

const App = () => {
  return (
    <div className="bg-gray-100 max-w-7xl mx-auto pt-12 px-1 sm:px-2 min-h-screen">
      <h1 className="text-4xl font-semibold mb-2">Power Consumption App</h1>
      <Chart />
    </div>
  );
};

export default App;
