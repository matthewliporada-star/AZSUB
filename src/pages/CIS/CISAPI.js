// pages/CIS/CISAPI.js (extend with OCR processing)
export const processOCRData = async (extractedText) => {
  const processedData = {
    personalInformation: {},
    travelDetails: [],
    habits: {},
    medical: {},
    // Add more sections as needed
  };

  // Personal Information
  const personalInfoPatterns = {
    fullName: /full name[\s:]*([^\n]+)/i,
    fathersName: /father['\s]*name[\s:]*([^\n]+)/i,
    dateOfBirth: /date of birth[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    mobileNo: /mobile[.\s]*no[.\s]*[:]?\s*([+\d\s-]{8,})/i,
    email: /email[\s:]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    residenceAddress: /residence address[\s:]*([^\n]+)/i,
    city: /city[\s:]*([a-zA-Z\s]+)/i,
    country: /country[\s:]*([a-zA-Z\s]+)/i,
    postalCode: /postal code[\s:]*([a-zA-Z0-9\s-]+)/i,
  };

  for (const [key, pattern] of Object.entries(personalInfoPatterns)) {
    const match = extractedText.match(pattern);
    if (match && match[1]) {
      processedData.personalInformation[key] = match[1].trim();
    }
  }

  // Travel Details
  const travelSection = extractedText.match(
    /travel details[\s\S]*?(?=\n\n|$)/i,
  );
  if (travelSection) {
    const lines = travelSection[0].split("\n");
    for (const line of lines) {
      if (line.match(/\d{4}/)) {
        const parts = line.split(/\s{2,}/);
        processedData.travelDetails.push({
          country: parts[0]?.trim() || "",
          city: parts[1]?.trim() || "",
          lengthOfStay: parts[2]?.trim() || "",
          frequency: parts[3]?.trim() || "",
          dateOfTravel: parts[4]?.trim() || "",
          reason: parts[5]?.trim() || "",
        });
      }
    }
  }

  // Habits
  processedData.habits = {
    smokerStatus:
      extractedText.match(/smoker status[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
    cigarettesPerDay:
      extractedText.match(/cigarettes[\s:]*(\d+)/i)?.[1]?.trim() || "",
    alcoholType:
      extractedText.match(/alcohol.*?type[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
    alcoholFrequency:
      extractedText.match(/frequency[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
  };

  // Medical
  processedData.medical = {
    height:
      extractedText.match(/height[\s:]*(\d+(?:\.\d+)?)/i)?.[1]?.trim() || "",
    weight:
      extractedText.match(/weight[\s:]*(\d+(?:\.\d+)?)/i)?.[1]?.trim() || "",
    exercise:
      extractedText.match(/do you exercise[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
    healthDisorders:
      extractedText.match(/health disorders[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
    medications:
      extractedText.match(/medication[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
  };

  return processedData;
};
