import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CheckboxGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-2.5">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <Checkbox
              id={`chk-${opt.value}`}
              checked={selected.includes(opt.value)}
              onCheckedChange={() => onToggle(opt.value)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary bg-background"
            />
            <Label
              htmlFor={`chk-${opt.value}`}
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
