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
      className="border rounded min-w-20"
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
