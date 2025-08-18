interface SelectorProps {
  id?: string;
  onSelect: (option: string) => void;
  selected: string;
  options: { value: string; description: string }[];
}

const Selector: React.FC<SelectorProps> = ({
  id,
  onSelect,
  selected,
  options,
}) => {
  return (
    <select
      id={id}
      value={selected}
      onChange={(e) => onSelect(e.target.value)}
      className="bg-gray-600 hover:bg-gray-700 rounded py-1.5 px-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.description}
        </option>
      ))}
    </select>
  );
};

export default Selector;
