import { useMemo } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export function FormikCombobox({
  formik,
  name,
  items,
  labelKey,
  valueKey,
  placeholder,
  ...props
}) {
  const selectedItem = useMemo(() => {
    return items.find((item) => item[valueKey] === formik.values[name]);
  }, [items, formik.values[name], valueKey]);

  return (
    <>
      <Combobox
        items={items}
        itemToStringValue={(item) => item[labelKey]}
        filter={(item, search) =>
          item?.[labelKey]?.toLowerCase().includes(search.toLowerCase())
        }
        value={selectedItem?.[labelKey] || ""}
        onValueChange={(val) => {
          const selected = items.find((item) => item[labelKey] === val);
          formik.setFieldValue(name, selected?.[valueKey] || "");
        }}
        {...props}
      >
        <ComboboxInput
          placeholder={placeholder}
          onBlur={() => formik.setFieldTouched(name, true)}
          className={`h-10 w-full border-border focus-within:ring-primary focus-within:ring-offset-2 transition-all duration-200 ${
            formik.touched[name] && formik.errors[name]
              ? "border-destructive focus-within:ring-destructive"
              : ""
          }`}
        />
        <ComboboxContent>
          <ComboboxEmpty>Aucun résultat.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item[valueKey]} value={item[labelKey]}>
                {item[labelKey]}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {formik.touched[name] && formik.errors[name] && (
        <p className="text-xs text-destructive">{formik.errors[name]}</p>
      )}
    </>
  );
}

/* 
<FormikCombobox
  formik={formik}
  name="domaine_id"
  items={domaines}
  labelKey="libelle"
  valueKey="id"
  disabled={formik.isSubmitting}
/> */
