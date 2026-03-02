export const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
  } catch {
    return dateString;
  }
};

export const getDateParts = (dateString) => {
  console.log("getDateParts received:", dateString, "Type:", typeof dateString);

  if (!dateString) return { month: "", day: "", year: "" };

  try {
    // Handle different date formats
    let date;
    if (typeof dateString === "string" && dateString.includes("-")) {
      // Handle YYYY-MM-DD format from input type="date"
      const [year, month, day] = dateString.split("-");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      console.log("Parsed from YYYY-MM-DD:", { year, month, day });
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return { month: "", day: "", year: "" };
    }

    const result = {
      month: String(date.getMonth() + 1).padStart(2, "0"),
      day: String(date.getDate()).padStart(2, "0"),
      year: date.getFullYear().toString(),
    };

    console.log("getDateParts result:", result);
    return result;
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return { month: "", day: "", year: "" };
  }
};

export const downloadPDF = (pdfBytes, filename) => {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const fillTextField = (form, fieldName, value) => {
  try {
    if (!value || value.toString().trim() === "") return false;
    const field = form.getTextField(fieldName);
    if (field) {
      field.setText(value.toString().trim());
      console.log(`Filled field "${fieldName}" with:`, value);
      return true;
    }
  } catch (e) {
    console.log(`Could not fill field "${fieldName}":`, e.message);
  }
  return false;
};

export const fillCheckbox = (form, fieldName, checked) => {
  try {
    const checkbox = form.getCheckBox(fieldName);
    if (checkbox) {
      checked ? checkbox.check() : checkbox.uncheck();
      return true;
    }
  } catch (e) {}
  return false;
};

export const loadPDFTemplate = async () => {
  const paths = [
    `${process.env.PUBLIC_URL}/IHP.pdf`,
    "/IHP.pdf",
    `${process.env.PUBLIC_URL}/forms/IHP.pdf`,
    "./IHP.pdf",
  ];

  for (const pdfUrl of paths) {
    try {
      console.log(`Trying to load PDF from: ${pdfUrl}`);
      const response = await fetch(pdfUrl);
      if (response.ok) {
        const pdfBytes = await response.arrayBuffer();
        console.log(`✓ Successfully loaded PDF from: ${pdfUrl}`);
        return pdfBytes;
      }
    } catch (error) {
      continue;
    }
  }
  throw new Error("PDF template not found");
};
