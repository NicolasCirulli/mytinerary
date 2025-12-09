import { SearchIcon } from '@shared/icons/SearchIcon';

interface CitySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const CitySearch = ({ value, onChange }: CitySearchProps) => {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        className="w-full rounded-xl border border-border bg-card py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Search for a city..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
