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
        {cats?.map((c: { id: number; category_name: string } | string) => {
          const id = typeof c === 'string' ? c : String(c.id);
          const name = typeof c === 'string' ? c : c.category_name;
          return (
            <SelectItem key={id} value={name}>
              {name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export default CategoryFilter