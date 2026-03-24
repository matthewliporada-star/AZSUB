// pages/CIS/components/FileUpload.jsx
import React, { useState } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const FileUpload = ({ section, onClose, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const extractTextFromScannedPDF = async (file) => {
    setUploading(true);
    setFileName(file.name);

    try {
      // Convert PDF pages to images
      const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
      const numPages = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Perform OCR on the page image
        const {
          data: { text },
        } = await Tesseract.recognize(canvas, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              const pageProgress = (i - 1) / numPages;
              const currentProgress = pageProgress + m.progress / numPages;
              setProgress(currentProgress * 100);
            }
          },
        });

        fullText += text + "\n";
        setProgress((i / numPages) * 100);
      }

      // Parse extracted text to match your form structure
      const parsedData = parseToFormStructure(fullText);

      // Pass the extracted data back to parent
      if (onUploadComplete) {
        onUploadComplete(parsedData);
      }

      // Close the modal after successful upload
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF. Please ensure the file is not corrupted.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      extractTextFromScannedPDF(file);
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  const parseToFormStructure = (extractedText) => {
    // Parse and map to your existing form structure
    return {
      personalInformation: parsePersonalInfo(extractedText),
      travelDetails: parseTravelDetails(extractedText),
      habits: parseHabits(extractedText),
      medical: parseMedical(extractedText),
      spouse: parseSpouse(extractedText),
      dependents: parseDependents(extractedText),
      businessEmployment: parseBusinessEmployment(extractedText),
      personalIncome: parsePersonalIncome(extractedText),
      assetsLiabilities: parseAssetsLiabilities(extractedText),
      propertyDetails: parsePropertyDetails(extractedText),
      bankDetails: parseBankDetails(extractedText),
      existingPending: parseExistingPending(extractedText),
      policyBeneficiary: parsePolicyBeneficiary(extractedText),
    };
  };

  // Individual parsers for each section
  const parsePersonalInfo = (text) => {
    const patterns = {
      fullName: /full name[\s:]*([^\n]+)/i,
      fathersName: /father['\s]*name[\s:]*([^\n]+)/i,
      mobileNo: /mobile[.\s]*no[.\s]*[:]?\s*([+\d\s-]{8,})/i,
      email: /email[\s:]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      residenceAddress: /residence address[\s:]*([^\n]+)/i,
      residenceCity: /city[\s:]*([a-zA-Z\s]+)/i,
      residenceCountry: /country[\s:]*([a-zA-Z\s]+)/i,
      residenceZip: /postal code[\s:]*([a-zA-Z0-9\s-]+)/i,
      residenceDuration: /how long.*?current address.*?(\d+)/i,
      citizenship: /citizenship[\s:]*([^\n]+)/i,
      hobbies: /hobbies[\s:]*([^\n]+)/i,
    };

    const personalInfo = {};
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match && match[1]) {
        personalInfo[key] = match[1].trim();
      }
    }

    return personalInfo;
  };

  const parseTravelDetails = (text) => {
    const travelDetails = [];
    const travelSection = text.match(/travel details[\s\S]*?(?=\n\n|$)/i);

    if (travelSection) {
      const lines = travelSection[0].split("\n");
      let travelIndex = 0;

      for (const line of lines) {
        if (line.match(/\d{4}/)) {
          const parts = line.split(/\s{2,}/);
          travelDetails.push({
            country: parts[0]?.trim() || "",
            city: parts[1]?.trim() || "",
            lengthOfStay: parts[2]?.trim() || "",
            frequency: parts[3]?.trim() || "",
            dateOfTravel: parts[4]?.trim() || "",
            reason: parts[5]?.trim() || "",
          });
          travelIndex++;
        }
      }
    }

    return travelDetails;
  };

  const parseHabits = (text) => {
    return {
      smokerStatus:
        text.match(/smoker status[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      cigarettesPerDay: text.match(/cigarettes[\s:]*(\d+)/i)?.[1]?.trim() || "",
      smokingHistory:
        text.match(/smoking earlier[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      alcoholType:
        text.match(/alcohol.*?type[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      alcoholMeasurement:
        text.match(/measurement[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      alcoholFrequency:
        text.match(/frequency[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
    };
  };

  const parseMedical = (text) => {
    return {
      height: text.match(/height[\s:]*(\d+(?:\.\d+)?)/i)?.[1]?.trim() || "",
      weight: text.match(/weight[\s:]*(\d+(?:\.\d+)?)/i)?.[1]?.trim() || "",
      exercise_details:
        text.match(/do you exercise[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      health_disorders:
        text.match(/health disorders[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      medications:
        text.match(/medication taken[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      physician_name:
        text.match(/family physician[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      physician_phone:
        text.match(/telephone[\s:]*([+\d\s-]+)/i)?.[1]?.trim() || "",
    };
  };

  const parseSpouse = (text) => {
    return {
      spouse_name: text.match(/spouse name[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      spouse_rel: text.match(/relationship[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      spouse_nat: text.match(/nationality[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
    };
  };

  const parseDependents = (text) => {
    const dependents = [];
    const dependentMatches = [...text.matchAll(/dependent[\s:]*([^\n]+)/gi)];
    dependentMatches.forEach((match, idx) => {
      if (idx < 2) {
        dependents.push({
          name: match[1]?.trim() || "",
        });
      }
    });
    return dependents;
  };

  const parseBusinessEmployment = (text) => {
    return {
      businessName:
        text.match(/business name[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      occupation: text.match(/occupation[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      businessNature:
        text.match(/nature of business[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
    };
  };

  const parsePersonalIncome = (text) => {
    const income = [];
    const incomeMatch = text.match(/income[\s:]*\$?([\d,]+)/i);
    if (incomeMatch) {
      income.push({
        selfAmount: incomeMatch[1]?.replace(/,/g, "") || "0",
        frequency: "Monthly",
      });
    }
    return income;
  };

  const parseAssetsLiabilities = (text) => {
    return {
      assets: [],
      liabilities: [],
    };
  };

  const parsePropertyDetails = (text) => {
    return [];
  };

  const parseBankDetails = (text) => {
    return {
      bankName: text.match(/bank name[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
      bankAccountNumber:
        text.match(/account number[\s:]*([^\n]+)/i)?.[1]?.trim() || "",
    };
  };

  const parseExistingPending = (text) => {
    return [];
  };

  const parsePolicyBeneficiary = (text) => {
    return [];
  };

  return (
    <div className="file-upload-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Upload Scanned PDF for {section}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="file-upload-container">
            <div className="upload-area">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
                id="pdf-upload"
                style={{ display: "none" }}
              />
              <label htmlFor="pdf-upload" className="upload-label">
                {uploading ? (
                  <div className="upload-progress">
                    <p>Processing: {fileName}</p>
                    <progress value={progress} max="100" />
                    <p>{Math.round(progress)}% Complete</p>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <span>📄 Click to upload scanned PDF</span>
                    <small>
                      Supports scanned documents (OCR will extract text)
                    </small>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
