import CategoryFilter from '@/components/shared/CategoryFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortOptions,timeFilterOptions } from '@/lib/constants/paste-options';

interface SearchFiltersProps {
  q: string;
  category: string;
  time: string;
  sort: string;
  onQChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onSearch: () => void;
}

export default function SearchFilters({
  q, category, time, sort,
  onQChange, onCategoryChange, onTimeChange, onSortChange, onSearch,
}: SearchFiltersProps) {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search pastes…"
          value={q}
          onChange={(e) => onQChange(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="flex-1"
        />
        <Button onClick={onSearch}>Search</Button>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <CategoryFilter value={category} onChange={onCategoryChange} />

        <Select value={time} onValueChange={onTimeChange}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Time" /></SelectTrigger>
          <SelectContent>
            {timeFilterOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
