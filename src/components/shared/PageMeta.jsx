import { useEffect } from "react";

export const PageMeta = ({ title, description }) => {
  useEffect(() => {
    document.title = title
      ? `${title} | Pôle Emploi PAJDEF`
      : "Pôle Emploi - PAJDEF";

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", description);
    }
  }, [title, description]);

  return null;
};
