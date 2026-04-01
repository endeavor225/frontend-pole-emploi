import * as React from "react";
import { useMemo } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

export function FormikMultiCombobox({
  formik,
  name,
  items = [],
  labelKey = "label",
  valueKey = "id",
  placeholder = "Sélectionner...",
  disabled = false,
}) {
  const anchor = useComboboxAnchor();

  const selectedItems = useMemo(() => {
    const values = formik.values[name] || [];
    return items.filter((item) => values.includes(item[valueKey]));
  }, [items, formik.values[name], valueKey]);

  const selectedLabels = selectedItems.map((item) => item[labelKey]);

  const handleChange = (labels) => {
    const ids = labels
      .map((label) => items.find((item) => item[labelKey] === label))
      .filter(Boolean)
      .map((item) => item[valueKey]);

    formik.setFieldValue(name, ids);
  };

  return (
    <>
      <Combobox
        multiple
        autoHighlight
        items={items.map((i) => i[labelKey])}
        value={selectedLabels}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <ComboboxChips
          ref={anchor}
          className={`w-full h-11 border-border focus-within:ring-primary focus-within:ring-offset-2 transition-all duration-200 ${
            formik.touched[name] && formik.errors[name]
              ? "border-destructive focus-within:ring-destructive"
              : ""
          }`}
        >
          <ComboboxValue>
            {(values) => (
              <>
                {values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder={placeholder}
                  onBlur={() => formik.setFieldTouched(name, true)}
                  className="flex-1 text-black"
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>

        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Aucun résultat.</ComboboxEmpty>

          <ComboboxList>
            {(label) => (
              <ComboboxItem key={label} value={label}>
                {label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {formik.touched[name] && formik.errors[name] && (
        <p className="text-xs text-destructive mt-1">{formik.errors[name]}</p>
      )}
    </>
  );
}

/* 
<FormikMultiCombobox
  formik={formik}
  name="domainesIds"
  items={domaines}
  labelKey="libelle"
  valueKey="id"
  disabled={formik.isSubmitting}
/> */
