import { useCategories } from "@/hooks/useCategories";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface CategoryFilterProps {
  value: string;
  onChange: (newVal: string) => void;
}

const CategoryFilter = ({
  value,
  onChange,
}: CategoryFilterProps) => {
  const { data: cats, isLoading } = useCategories();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder={isLoading ? "Loading…" : "Category"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {cats?.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CategoryFilter