import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";

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