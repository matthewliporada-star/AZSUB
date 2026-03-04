import React, { useState, useEffect } from "react";
// CSS is loaded by FormModal wrapper via FormStyles.css
import { PDFDocument } from "pdf-lib";

// Component imports
import FormSection from "./components/FormSection";
import DependentSection from "./components/DependentSection";
import HealthDeclarationSection from "./components/HealthDeclarationSection";
import AddressSection from "./components/AddressSection";
import WorkInformationSection from "./components/WorkInformationSection";
import ContactSection from "./components/ContactSection";
import ContingentOwnerSection from "./components/ContingentOwnerSection";
import CurrentInsuranceSection from "./components/CurrentInsuranceSection";
import PlanInfoSection from "./components/PlanInfoSection";
import ProposedInsuredSection from "./components/ProposedInsuredSection";
import SignatureSection from "./components/SignatureSection";
import AuthorizationSection from "./components/AuthorizationSection";
import TestPDFButton from "./components/TestPDFButton";
import PDFButton from "./components/PDFButton";
import ResetButton from "./components/ResetButton";
import SubmitButton from "./components/SubmitButton";

// Constants and utilities
import {
  INITIAL_DEPENDENT,
  INITIAL_HEALTH_QUESTIONS,
  INITIAL_POLICY_INFO,
  INITIAL_ADDITIONAL_CONDITION,
  INITIAL_FORM_DATA,
  ILLNESS_OPTIONS,
} from "./constants/formConstants";
import { MOCK_IHP_DATA } from "./constants/mockIhpData";
import {
  formatDate,
  getDateParts,
  downloadPDF,
  fillTextField,
  fillCheckbox,
  loadPDFTemplate,
} from "./utils/pdfHelpers";

function IHPForm({ sharedData, updateSharedData }) {
  // State management
  const [dependents, setDependents] = useState([
    { ...INITIAL_DEPENDENT, id: 1 },
  ]);
  const [healthQuestions, setHealthQuestions] = useState(
    INITIAL_HEALTH_QUESTIONS,
  );
  const [policyInfo, setPolicyInfo] = useState(INITIAL_POLICY_INFO);
  const [additionalConditions, setAdditionalConditions] = useState([
    { ...INITIAL_ADDITIONAL_CONDITION },
  ]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Debug effect to check dependent DOB values
  useEffect(() => {
    console.log("========== DEPENDENT DEBUG ==========");
    console.log("Total dependents:", dependents.length);

    dependents.forEach((dep, index) => {
      console.log(`\n--- Dependent ${index + 1} (ID: ${dep.id}) ---`);
      console.log("Raw dob value:", dep.dob);
      console.log("Type of dob:", typeof dep.dob);

      if (dep.dob) {
        const testDate = new Date(dep.dob);
        console.log("JavaScript Date object:", testDate);
        console.log("Is valid date?", !isNaN(testDate.getTime()));

        const parts = getDateParts(dep.dob);
        console.log("getDateParts result:", parts);
      } else {
        console.log("DOB is empty or undefined");
      }
    });
    console.log("====================================");
  }, [dependents]);

  // Generic update handlers
  const handleChange = (path, value) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleNestedChange = (parent, field, value) => {
    handleChange(`${parent}.${field}`, value);
  };

  // Dependent handlers
  const handleDependentChange = (index, field, value) => {
    setDependents((prev) => {
      const updated = [...prev];
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        // Ensure the parent object exists
        if (
          !updated[index][parent] ||
          typeof updated[index][parent] === "string"
        ) {
          updated[index][parent] = {};
        }
        updated[index][parent][child] = value;
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const addDependent = () =>
    setDependents((prev) => [
      ...prev,
      { ...INITIAL_DEPENDENT, id: prev.length + 1 },
    ]);

  const removeDependent = (id) =>
    setDependents((prev) => prev.filter((d) => d.id !== id));

  // Health questions handler
  const handleHealthQuestionChange = (person, question, subQuestion, value) => {
    setHealthQuestions((prev) => {
      const updated = { ...prev };
      if (subQuestion) {
        updated[person][question][subQuestion] = value;
      } else {
        updated[person][question] = value;
      }
      return updated;
    });
  };

  // Additional conditions handlers
  const handleAdditionalConditionChange = (index, field, value) => {
    setAdditionalConditions((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addAdditionalCondition = () =>
    setAdditionalConditions((prev) => [
      ...prev,
      { ...INITIAL_ADDITIONAL_CONDITION },
    ]);

  const removeAdditionalCondition = (index) =>
    setAdditionalConditions((prev) => prev.filter((_, i) => i !== index));

  const handleAutoFill = () => {
    setFormData(MOCK_IHP_DATA.formData);
    setDependents(MOCK_IHP_DATA.dependents);
    setHealthQuestions(MOCK_IHP_DATA.healthQuestions);
    setPolicyInfo(MOCK_IHP_DATA.policyInfo);
    setAdditionalConditions(MOCK_IHP_DATA.additionalConditions);
  };

  // PDF Testing function
  const testPDFFilling = async () => {
    try {
      console.log("Testing PDF fields...");
      const pdfBytes = await loadPDFTemplate();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      const allFields = form.getFields();
      const fieldNames = allFields.map((field) => field.getName());

      console.log(`Total fields: ${fieldNames.length}`);
      console.log("First 20 fields:", fieldNames.slice(0, 20));

      alert(
        `Found ${fieldNames.length} PDF fields. Check console for details.`,
      );

      showFieldsModal(fieldNames);
    } catch (error) {
      console.error("PDF test failed:", error);
      alert(`Test failed: ${error.message}`);
    }
  };

  // Show fields modal function
  const showFieldsModal = (fieldNames) => {
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 25px;
      border: 2px solid #003266;
      border-radius: 10px;
      z-index: 1000;
      max-width: 800px;
      max-height: 600px;
      overflow: auto;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
      font-family: 'Axiforma', sans-serif;
    `;

    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="color: #003266; margin: 0;">PDF Form Fields (${fieldNames.length})</h3>
        <button id="closeModal" style="
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Close</button>
      </div>
      <div style="
        background: #f8f9fa;
        border: 1px solid #e5e7eb;
        border-radius: 5px;
        padding: 15px;
        max-height: 400px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 12px;
      ">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #e9ecef;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">#</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Field Name</th>
            </tr>
          </thead>
          <tbody>
            ${fieldNames
        .map(
          (field, index) => `
                <tr style="${index % 2 === 0 ? "background: #fff;" : "background: #f8f9fa;"}">
                  <td style="padding: 6px 8px; border-bottom: 1px solid #dee2e6;">${index + 1}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #dee2e6;">
                    <span style="color: #003266; font-weight: 500; font-family: monospace;">"${field}"</span>
                  </td>
                </tr>
              `,
        )
        .join("")}
          </tbody>
        </table>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <button id="copyFields" style="
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          flex: 1;
          font-weight: 600;
        ">Copy Field Names</button>
        <button id="closeModal2" style="
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          flex: 1;
          font-weight: 600;
        ">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("closeModal").onclick = () => modal.remove();
    document.getElementById("closeModal2").onclick = () => modal.remove();

    document.getElementById("copyFields").onclick = () => {
      navigator.clipboard
        .writeText(fieldNames.join("\n"))
        .then(() => alert("Field names copied to clipboard!"))
        .catch((err) => {
          console.error("Copy failed:", err);
          const textArea = document.createElement("textarea");
          textArea.value = fieldNames.join("\n");
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
            alert("Field names copied to clipboard!");
          } catch (err) {
            alert("Failed to copy field names. Please copy manually.");
          }
          document.body.removeChild(textArea);
        });
    };

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  };

  // PDF Generation
  const generatePDF = async () => {
    try {
      console.log("Starting PDF generation...");
      const pdfBytes = await loadPDFTemplate();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      // ============ DATE FIELDS - CORRECTED MAPPING ============
      // Based on your image showing "20" in what should be the month field,
      // the fields are actually in DAY, MONTH, YEAR order

      console.log("========== FILLING DATE FIELDS ==========");

      // Applicant Owner DOB (db1, db2, db3)
      if (formData.dob) {
        const parts = getDateParts(formData.dob);
        console.log("Applicant DOB parts:", parts);
        fillTextField(form, "db1", parts.day); // Day in db1
        fillTextField(form, "db2", parts.month); // Month in db2
        fillTextField(form, "db3", parts.year); // Year in db3
      }

      // Contingent Owner DOB (db4, db5, db6)
      if (formData.contingentOwner?.dob) {
        const parts = getDateParts(formData.contingentOwner.dob);
        console.log("Contingent Owner DOB parts:", parts);
        fillTextField(form, "db4", parts.day); // Day
        fillTextField(form, "db5", parts.month); // Month
        fillTextField(form, "db6", parts.year); // Year
      }

      // Proposed Insured DOB (db7, db8, appn3)
      if (
        !formData.proposedInsured?.sameAsApplicant &&
        formData.proposedInsured?.dob
      ) {
        const parts = getDateParts(formData.proposedInsured.dob);
        console.log("Proposed Insured DOB parts:", parts);
        fillTextField(form, "db7", parts.day); // Day
        fillTextField(form, "db8", parts.month); // Month
        fillTextField(form, "db9", parts.year); // Year
      }

      // DEPENDENT 1 DOB (d10, db11, db12)
      if (dependents.length > 0 && dependents[0]?.dob) {
        const parts = getDateParts(dependents[0].dob);
        console.log("Dependent 1 DOB parts:", parts);
        fillTextField(form, "db10", parts.day); // Day (this is where "20" should go)
        fillTextField(form, "db11", parts.month); // Month
        fillTextField(form, "db12", parts.year); // Year
      }

      // DEPENDENT 2 DOB (db13, db14, db15)
      if (dependents.length > 1 && dependents[1]?.dob) {
        const parts = getDateParts(dependents[1].dob);
        console.log("Dependent 2 DOB parts:", parts);
        fillTextField(form, "db13", parts.day); // Day
        fillTextField(form, "db14", parts.month); // Month
        fillTextField(form, "db15", parts.year); // Year
      }

      // Current Insurance Effective Dates (date1, date2, date3)
      if (formData.currentInsurance?.effectiveDate) {
        const parts = getDateParts(formData.currentInsurance.effectiveDate);
        console.log("Current Insurance date parts:", parts);
        fillTextField(form, "date1", parts.day); // Day
        fillTextField(form, "date2", parts.month); // Month
        fillTextField(form, "date3", parts.year); // Year
      }

      // Proposed Insured Current Insurance (date7, date8, date9)
      if (
        !formData.proposedInsured?.sameAsApplicant &&
        formData.proposedInsured?.currentInsurance?.effectiveDate
      ) {
        const parts = getDateParts(
          formData.proposedInsured.currentInsurance.effectiveDate,
        );
        console.log("Proposed Insured Insurance date parts:", parts);
        fillTextField(form, "date7", parts.day); // Day
        fillTextField(form, "date8", parts.month); // Month
        fillTextField(form, "date9", parts.year); // Year
      }

      // Dependent 1 Current Insurance (date10, date11, date12)
      if (
        dependents.length > 0 &&
        dependents[0]?.currentInsurance?.effectiveDate
      ) {
        const parts = getDateParts(
          dependents[0].currentInsurance.effectiveDate,
        );
        console.log("Dependent 1 Insurance date parts:", parts);
        fillTextField(form, "date10", parts.day); // Day
        fillTextField(form, "date11", parts.month); // Month
        fillTextField(form, "date12", parts.year); // Year
      }

      // Dependent 2 Current Insurance (date13, date14, date15)
      if (
        dependents.length > 1 &&
        dependents[1]?.currentInsurance?.effectiveDate
      ) {
        const parts = getDateParts(
          dependents[1].currentInsurance.effectiveDate,
        );
        console.log("Dependent 2 Insurance date parts:", parts);
        fillTextField(form, "date13", parts.day); // Day
        fillTextField(form, "date14", parts.month); // Month
        fillTextField(form, "date15", parts.year); // Year
      }

      // Commencement of Cover Note (date4, date5, date6)
      if (policyInfo.commencementOfCoverNote) {
        const parts = getDateParts(policyInfo.commencementOfCoverNote);
        console.log("Cover Note date parts:", parts);
        fillTextField(form, "date4", parts.day); // Day
        fillTextField(form, "date5", parts.month); // Month
        fillTextField(form, "date6", parts.year); // Year
      }

      // ============ CHECKBOX FIELDS ============

      // Section A - Applicant Owner
      fillCheckbox(form, "yes1", formData.usPerson === "Yes");
      fillCheckbox(form, "no1", formData.usPerson === "No");
      fillCheckbox(form, "male1", formData.gender === "Male");
      fillCheckbox(form, "female1", formData.gender === "Female");
      fillCheckbox(form, "single1", formData.civilStatus === "Single");
      fillCheckbox(form, "married1", formData.civilStatus === "Married");
      fillCheckbox(form, "widowed1", formData.civilStatus === "Widowed");
      fillCheckbox(form, "divorced1", formData.civilStatus === "Divorced");
      fillCheckbox(form, "separated1", formData.civilStatus === "Separated");
      fillCheckbox(form, "annulled1", formData.civilStatus === "Annulled");

      // Preferred Mailing Address
      fillCheckbox(
        form,
        "present1",
        formData.preferredMailingAddress === "Present",
      );
      fillCheckbox(form, "work1", formData.preferredMailingAddress === "Work");

      // Source of Funds
      fillCheckbox(form, "business1", formData.sourceOfFunds.business);
      fillCheckbox(form, "salary1", formData.sourceOfFunds.salaryCommission);
      fillCheckbox(
        form,
        "donations1",
        formData.sourceOfFunds.donationsContributions,
      );
      fillCheckbox(
        form,
        "remittances1",
        formData.sourceOfFunds.remittancesAllowancesPension,
      );
      fillCheckbox(form, "investments1", formData.sourceOfFunds.investments);
      fillCheckbox(form, "others1", formData.sourceOfFunds.others);

      // Section B - Payment Mode
      fillCheckbox(form, "monthly1", policyInfo.modeOfPayment === "Monthly");
      fillCheckbox(
        form,
        "quarterly1",
        policyInfo.modeOfPayment === "Quarterly",
      );
      fillCheckbox(form, "semi1", policyInfo.modeOfPayment === "SemiAnnual");
      fillCheckbox(form, "annual1", policyInfo.modeOfPayment === "Annual");

      // Payment Scheme
      fillCheckbox(
        form,
        "cashcheck1",
        policyInfo.paymentScheme === "Cash/Check",
      );
      fillCheckbox(
        form,
        "creditcard1",
        policyInfo.paymentScheme === "Credit Card",
      );
      fillCheckbox(form, "debit1", policyInfo.paymentScheme === "Debit Card");
      fillCheckbox(form, "autodeb1", policyInfo.paymentScheme === "Auto Debit");

      // Section C - Proposed Insured
      if (!formData.proposedInsured?.sameAsApplicant) {
        fillCheckbox(form, "male2", formData.proposedInsured.gender === "Male");
        fillCheckbox(
          form,
          "female2",
          formData.proposedInsured.gender === "Female",
        );
        fillCheckbox(
          form,
          "single2",
          formData.proposedInsured.civilStatus === "Single",
        );
        fillCheckbox(
          form,
          "married2",
          formData.proposedInsured.civilStatus === "Married",
        );
        fillCheckbox(
          form,
          "widowed2",
          formData.proposedInsured.civilStatus === "Widowed",
        );
        fillCheckbox(
          form,
          "divorced2",
          formData.proposedInsured.civilStatus === "Divorced",
        );
        fillCheckbox(
          form,
          "separated2",
          formData.proposedInsured.civilStatus === "Separated",
        );
        fillCheckbox(
          form,
          "annuled2",
          formData.proposedInsured.civilStatus === "Annulled",
        );
      }

      // Section D - Dependent 1
      if (dependents[0]) {
        fillCheckbox(form, "male3", dependents[0].gender === "Male");
        fillCheckbox(form, "female3", dependents[0].gender === "Female");
        fillCheckbox(form, "single3", dependents[0].civilStatus === "Single");
        fillCheckbox(form, "married3", dependents[0].civilStatus === "Married");
        fillCheckbox(form, "widowed3", dependents[0].civilStatus === "Widowed");
        fillCheckbox(
          form,
          "divorced3",
          dependents[0].civilStatus === "Divorced",
        );
        fillCheckbox(
          form,
          "separated3",
          dependents[0].civilStatus === "Separated",
        );
        fillCheckbox(
          form,
          "annulled3",
          dependents[0].civilStatus === "Annulled",
        );
      }

      // Section D - Dependent 2
      if (dependents[1]) {
        fillCheckbox(form, "male4", dependents[1].gender === "Male");
        fillCheckbox(form, "female4", dependents[1].gender === "Female");
        fillCheckbox(form, "single4", dependents[1].civilStatus === "Single");
        fillCheckbox(form, "married4", dependents[1].civilStatus === "Married");
        fillCheckbox(form, "widowed4", dependents[1].civilStatus === "Widowed");
        fillCheckbox(
          form,
          "divorced4",
          dependents[1].civilStatus === "Divorced",
        );
        fillCheckbox(
          form,
          "separated4",
          dependents[1].civilStatus === "Separated",
        );
        fillCheckbox(
          form,
          "annulled4",
          dependents[1].civilStatus === "Annulled",
        );
      }

      // Section E - Health Declaration Lifestyle
      fillCheckbox(form, "yes2", formData.healthDeclaration.smokeVape);
      fillCheckbox(form, "no2", !formData.healthDeclaration.smokeVape);
      fillCheckbox(form, "yes5", formData.healthDeclaration.alcohol);
      fillCheckbox(form, "no5", !formData.healthDeclaration.alcohol);
      fillCheckbox(form, "yes8", formData.healthDeclaration.glassesContacts);
      fillCheckbox(form, "no8", !formData.healthDeclaration.glassesContacts);

      // Health Questions - Applicant Owner
      fillCheckbox(form, "c1", healthQuestions.applicantOwner.q1.a);
      fillCheckbox(form, "c4", healthQuestions.applicantOwner.q1.b);
      fillCheckbox(form, "c7", healthQuestions.applicantOwner.q1.c);
      fillCheckbox(form, "c10", healthQuestions.applicantOwner.q1.d);
      fillCheckbox(form, "c13", healthQuestions.applicantOwner.q1.e);
      fillCheckbox(form, "c16", healthQuestions.applicantOwner.q1.f);
      fillCheckbox(form, "c19", healthQuestions.applicantOwner.q1.g);
      fillCheckbox(form, "c22", healthQuestions.applicantOwner.q1.h);
      fillCheckbox(form, "c25", healthQuestions.applicantOwner.q1.i);
      fillCheckbox(form, "c28", healthQuestions.applicantOwner.q1.j);
      fillCheckbox(form, "c31", healthQuestions.applicantOwner.q1.k);
      fillCheckbox(form, "c34", healthQuestions.applicantOwner.q1.l);
      fillCheckbox(form, "c37", healthQuestions.applicantOwner.q1.m);
      fillCheckbox(form, "c40", healthQuestions.applicantOwner.q1.n);
      fillCheckbox(form, "c43", healthQuestions.applicantOwner.q1.o);
      fillCheckbox(form, "c46", healthQuestions.applicantOwner.q1.p);
      fillCheckbox(form, "c49", healthQuestions.applicantOwner.q2.a);
      fillCheckbox(form, "c52", healthQuestions.applicantOwner.q2.b);
      fillCheckbox(form, "c55", healthQuestions.applicantOwner.q2.c);
      fillCheckbox(form, "c58", healthQuestions.applicantOwner.q3);
      fillCheckbox(form, "c61", healthQuestions.applicantOwner.q4);
      fillCheckbox(form, "c64", healthQuestions.applicantOwner.q5);
      fillCheckbox(form, "c67", healthQuestions.applicantOwner.q6);

      // Health Questions - Dependent 1
      if (dependents[0]) {
        fillCheckbox(form, "yes3", dependents[0].healthDeclaration.smokeVape);
        fillCheckbox(form, "no3", !dependents[0].healthDeclaration.smokeVape);
        fillCheckbox(form, "yes6", dependents[0].healthDeclaration.alcohol);
        fillCheckbox(form, "no6", !dependents[0].healthDeclaration.alcohol);
        fillCheckbox(
          form,
          "yes9",
          dependents[0].healthDeclaration.glassesContacts,
        );
        fillCheckbox(
          form,
          "no9",
          !dependents[0].healthDeclaration.glassesContacts,
        );

        fillCheckbox(form, "c2", healthQuestions.dependent1.q1.a);
        fillCheckbox(form, "c5", healthQuestions.dependent1.q1.b);
        fillCheckbox(form, "c8", healthQuestions.dependent1.q1.c);
        fillCheckbox(form, "c11", healthQuestions.dependent1.q1.d);
        fillCheckbox(form, "c14", healthQuestions.dependent1.q1.e);
        fillCheckbox(form, "c17", healthQuestions.dependent1.q1.f);
        fillCheckbox(form, "c20", healthQuestions.dependent1.q1.g);
        fillCheckbox(form, "c23", healthQuestions.dependent1.q1.h);
        fillCheckbox(form, "c26", healthQuestions.dependent1.q1.i);
        fillCheckbox(form, "c29", healthQuestions.dependent1.q1.j);
        fillCheckbox(form, "c32", healthQuestions.dependent1.q1.k);
        fillCheckbox(form, "c35", healthQuestions.dependent1.q1.l);
        fillCheckbox(form, "c38", healthQuestions.dependent1.q1.m);
        fillCheckbox(form, "c41", healthQuestions.dependent1.q1.n);
        fillCheckbox(form, "c44", healthQuestions.dependent1.q1.o);
        fillCheckbox(form, "c47", healthQuestions.dependent1.q1.p);
        fillCheckbox(form, "c50", healthQuestions.dependent1.q2.a);
        fillCheckbox(form, "c53", healthQuestions.dependent1.q2.b);
        fillCheckbox(form, "c56", healthQuestions.dependent1.q2.c);
        fillCheckbox(form, "c59", healthQuestions.dependent1.q3);
        fillCheckbox(form, "c62", healthQuestions.dependent1.q4);
        fillCheckbox(form, "c65", healthQuestions.dependent1.q5);
        fillCheckbox(form, "c68", healthQuestions.dependent1.q6);
      }

      // Health Questions - Dependent 2
      if (dependents[1]) {
        fillCheckbox(form, "yes4", dependents[1].healthDeclaration.smokeVape);
        fillCheckbox(form, "no4", !dependents[1].healthDeclaration.smokeVape);
        fillCheckbox(form, "yes7", dependents[1].healthDeclaration.alcohol);
        fillCheckbox(form, "no7", !dependents[1].healthDeclaration.alcohol);
        fillCheckbox(
          form,
          "yes10",
          dependents[1].healthDeclaration.glassesContacts,
        );
        fillCheckbox(
          form,
          "no10",
          !dependents[1].healthDeclaration.glassesContacts,
        );

        fillCheckbox(form, "c3", healthQuestions.dependent2.q1.a);
        fillCheckbox(form, "c6", healthQuestions.dependent2.q1.b);
        fillCheckbox(form, "c9", healthQuestions.dependent2.q1.c);
        fillCheckbox(form, "c12", healthQuestions.dependent2.q1.d);
        fillCheckbox(form, "c15", healthQuestions.dependent2.q1.e);
        fillCheckbox(form, "c18", healthQuestions.dependent2.q1.f);
        fillCheckbox(form, "c21", healthQuestions.dependent2.q1.g);
        fillCheckbox(form, "c24", healthQuestions.dependent2.q1.h);
        fillCheckbox(form, "c27", healthQuestions.dependent2.q1.i);
        fillCheckbox(form, "c30", healthQuestions.dependent2.q1.j);
        fillCheckbox(form, "c33", healthQuestions.dependent2.q1.k);
        fillCheckbox(form, "c36", healthQuestions.dependent2.q1.l);
        fillCheckbox(form, "c39", healthQuestions.dependent2.q1.m);
        fillCheckbox(form, "c42", healthQuestions.dependent2.q1.n);
        fillCheckbox(form, "c45", healthQuestions.dependent2.q1.o);
        fillCheckbox(form, "c48", healthQuestions.dependent2.q1.p);
        fillCheckbox(form, "c51", healthQuestions.dependent2.q2.a);
        fillCheckbox(form, "c54", healthQuestions.dependent2.q2.b);
        fillCheckbox(form, "c57", healthQuestions.dependent2.q2.c);
        fillCheckbox(form, "c60", healthQuestions.dependent2.q3);
        fillCheckbox(form, "c63", healthQuestions.dependent2.q4);
        fillCheckbox(form, "c66", healthQuestions.dependent2.q5);
        fillCheckbox(form, "c69", healthQuestions.dependent2.q6);
      }

      // Section F - General Declaration
      fillCheckbox(form, "check1", formData.authorizeInfoSharing);

      // ============ TEXT FIELDS ============

      // Applicant Name
      fillTextField(
        form,
        "name1",
        `${formData.lastName}, ${formData.firstName} ${formData.middleName} ${formData.suffix}`.trim(),
      );
      fillTextField(form, "name2", formData.otherLegalName);

      // Applicant Basic Info
      fillTextField(form, "placeofb1", formData.placeOfBirth);
      fillTextField(form, "nation1", formData.nationality);
      fillTextField(form, "cr1", formData.countryOfResidence);
      fillTextField(form, "ds1", formData.durationOfStay);
      fillTextField(form, "sss1", formData.tin);

      // Applicant Address
      fillTextField(form, "unit1", formData.presentAddress?.unitBuilding);
      fillTextField(form, "lot1", formData.presentAddress?.lotBlockStreet);
      fillTextField(
        form,
        "barangay1",
        formData.presentAddress?.barangaySubdivision,
      );
      fillTextField(form, "city1", formData.presentAddress?.cityMunicipality);
      fillTextField(form, "province1", formData.presentAddress?.province);
      fillTextField(form, "country1", formData.presentAddress?.country);
      fillTextField(form, "zip1", formData.presentAddress?.zipCode);

      // Applicant Work Info
      fillTextField(form, "unit2", formData.workInformation?.unitBuilding);
      fillTextField(form, "lot2", formData.workInformation?.lotBlockStreet);
      fillTextField(
        form,
        "barangay2",
        formData.workInformation?.barangaySubdivision,
      );
      fillTextField(form, "city2", formData.workInformation?.cityMunicipality);
      fillTextField(form, "province2", formData.workInformation?.province);
      fillTextField(form, "country2", formData.workInformation?.country);
      fillTextField(form, "zip2", formData.workInformation?.zipCode);
      fillTextField(
        form,
        "eai1",
        formData.workInformation?.estimatedAnnualIncome,
      );
      fillTextField(form, "occupation1", formData.workInformation?.occupation);
      fillTextField(form, "employer1", formData.workInformation?.employer);
      fillTextField(form, "nb1", formData.workInformation?.natureOfBusiness);

      // Contact Info
      fillTextField(
        form,
        "contactno1",
        formData.contactInformation?.primaryContact,
      );
      fillTextField(
        form,
        "contactno2",
        formData.contactInformation?.secondaryContact,
      );
      fillTextField(form, "email1", formData.contactInformation?.email);

      // Contingent Owner
      fillTextField(
        form,
        "death1",
        `${formData.contingentOwner.lastName}, ${formData.contingentOwner.firstName} ${formData.contingentOwner.middleName} ${formData.contingentOwner.suffix}`.trim(),
      );
      fillTextField(form, "relation1", formData.contingentOwner.relationship);

      // Current Insurance
      fillTextField(form, "details1", formData.currentInsurance?.provider);
      fillTextField(form, "insurancep1", formData.currentInsurance?.provider);
      fillTextField(form, "pn1", formData.currentInsurance?.policyNumber);

      // Plan Information
      const appNumber = `APP-${new Date().getTime().toString().slice(-6)}`;
      fillTextField(form, "appn1", appNumber);
      fillTextField(form, "appn2", appNumber);
      fillTextField(form, "baseplan1", policyInfo.basePlan);
      fillTextField(form, "amountinsured1", policyInfo.amountInsured);
      fillTextField(form, "paymentdeposit1", policyInfo.amountOfPaymentDeposit);
      fillTextField(form, "deductible1", policyInfo.deductible);
      fillTextField(form, "copayment", policyInfo.coPayment);
      fillTextField(form, "text_75dret", policyInfo.areaOfCover);

      // Proposed Insured
      if (!formData.proposedInsured?.sameAsApplicant) {
        fillTextField(
          form,
          "name3",
          `${formData.proposedInsured.lastName}, ${formData.proposedInsured.firstName} ${formData.proposedInsured.middleName} ${formData.proposedInsured.suffix}`.trim(),
        );
        fillTextField(
          form,
          "name4",
          `${formData.proposedInsured.firstName} ${formData.proposedInsured.middleName} ${formData.proposedInsured.lastName} ${formData.proposedInsured.suffix}`.trim(),
        );
        fillTextField(form, "placeofb2", formData.proposedInsured.placeOfBirth);
        fillTextField(form, "nation2", formData.proposedInsured.nationality);
        fillTextField(form, "cr2", formData.proposedInsured.countryOfResidence);
        fillTextField(form, "ds2", formData.proposedInsured.durationOfStay);
        fillTextField(form, "sss2", formData.proposedInsured.tin);
        fillTextField(
          form,
          "unit3",
          formData.proposedInsured.presentAddress?.unitBuilding,
        );
        fillTextField(
          form,
          "lot3",
          formData.proposedInsured.presentAddress?.lotBlockStreet,
        );
        fillTextField(
          form,
          "barangay3",
          formData.proposedInsured.presentAddress?.barangaySubdivision,
        );
        fillTextField(
          form,
          "city3",
          formData.proposedInsured.presentAddress?.cityMunicipality,
        );
        fillTextField(
          form,
          "province3",
          formData.proposedInsured.presentAddress?.province,
        );
        fillTextField(
          form,
          "country3",
          formData.proposedInsured.presentAddress?.country,
        );
        fillTextField(
          form,
          "zip3",
          formData.proposedInsured.presentAddress?.zipCode,
        );
        fillTextField(
          form,
          "eai2",
          formData.proposedInsured.workInformation?.estimatedAnnualIncome,
        );
        fillTextField(
          form,
          "occupation2",
          formData.proposedInsured.workInformation?.occupation,
        );
        fillTextField(
          form,
          "employer2",
          formData.proposedInsured.workInformation?.employer,
        );
        fillTextField(
          form,
          "nb2",
          formData.proposedInsured.workInformation?.natureOfBusiness,
        );
        fillTextField(
          form,
          "relationshipo1",
          formData.proposedInsured.relationshipToOwner,
        );
        fillTextField(
          form,
          "insurancep2",
          formData.proposedInsured.currentInsurance?.provider,
        );
        fillTextField(
          form,
          "pn2",
          formData.proposedInsured.currentInsurance?.policyNumber,
        );
      }

      // Dependent 1
      if (dependents[0]) {
        fillTextField(
          form,
          "name5",
          `${dependents[0].lastName}, ${dependents[0].firstName} ${dependents[0].middleName} ${dependents[0].suffix}`.trim(),
        );
        fillTextField(
          form,
          "name6",
          `${dependents[0].firstName} ${dependents[0].middleName} ${dependents[0].lastName} ${dependents[0].suffix}`.trim(),
        );
        fillTextField(form, "othername1", dependents[0].otherLegalName);
        fillTextField(form, "placeofb3", dependents[0].placeOfBirth);
        fillTextField(form, "nation3", dependents[0].nationality);
        fillTextField(form, "cr3", dependents[0].countryOfResidence);
        fillTextField(form, "ds3", dependents[0].durationOfStay);
        fillTextField(form, "sss3", dependents[0].tin);
        fillTextField(
          form,
          "unit5",
          dependents[0].presentAddress?.unitBuilding,
        );
        fillTextField(
          form,
          "lot5",
          dependents[0].presentAddress?.lotBlockStreet,
        );
        fillTextField(
          form,
          "barangay5",
          dependents[0].presentAddress?.barangaySubdivision,
        );
        fillTextField(
          form,
          "city5",
          dependents[0].presentAddress?.cityMunicipality,
        );
        fillTextField(
          form,
          "province5",
          dependents[0].presentAddress?.province,
        );
        fillTextField(form, "country5", dependents[0].presentAddress?.country);
        fillTextField(form, "zip5", dependents[0].presentAddress?.zipCode);
        fillTextField(form, "relationshipo2", dependents[0].relationship);
        fillTextField(form, "cip2", dependents[0].currentInsurance?.provider);
        fillTextField(
          form,
          "pn3",
          dependents[0].currentInsurance?.policyNumber,
        );
      }

      // Dependent 2
      if (dependents[1]) {
        fillTextField(
          form,
          "name7",
          `${dependents[1].lastName}, ${dependents[1].firstName} ${dependents[1].middleName} ${dependents[1].suffix}`.trim(),
        );
        fillTextField(
          form,
          "name8",
          `${dependents[1].firstName} ${dependents[1].middleName} ${dependents[1].lastName} ${dependents[1].suffix}`.trim(),
        );
        fillTextField(form, "othername2", dependents[1].otherLegalName);
        fillTextField(form, "placeofb4", dependents[1].placeOfBirth);
        fillTextField(form, "nation4", dependents[1].nationality);
        fillTextField(form, "cr4", dependents[1].countryOfResidence);
        fillTextField(form, "ds4", dependents[1].durationOfStay);
        fillTextField(form, "sss4", dependents[1].tin);
        fillTextField(
          form,
          "unit7",
          dependents[1].presentAddress?.unitBuilding,
        );
        fillTextField(
          form,
          "lot7",
          dependents[1].presentAddress?.lotBlockStreet,
        );
        fillTextField(
          form,
          "barangay7",
          dependents[1].presentAddress?.barangaySubdivision,
        );
        fillTextField(
          form,
          "city7",
          dependents[1].presentAddress?.cityMunicipality,
        );
        fillTextField(
          form,
          "province7",
          dependents[1].presentAddress?.province,
        );
        fillTextField(form, "country7", dependents[1].presentAddress?.country);
        fillTextField(form, "zip7", dependents[1].presentAddress?.zipCode);
        fillTextField(form, "relationshipo3", dependents[1].relationship);
        fillTextField(form, "cip3", dependents[1].currentInsurance?.provider);
        fillTextField(
          form,
          "pn4",
          dependents[1].currentInsurance?.policyNumber,
        );
      }

      // Health Declaration
      fillTextField(form, "ft1", formData.healthDeclaration.heightFeet);
      fillTextField(form, "m1", formData.healthDeclaration.heightMeters);
      fillTextField(form, "kg1", formData.healthDeclaration.weightKg);
      fillTextField(form, "lbs1", formData.healthDeclaration.weightLbs);
      fillTextField(form, "stick1", formData.healthDeclaration.smokeQuantity);
      fillTextField(
        form,
        "bottle1",
        formData.healthDeclaration.alcoholQuantity,
      );
      fillTextField(form, "grade1", formData.healthDeclaration.eyeGrade);
      fillTextField(
        form,
        "appn7",
        healthQuestions.applicantOwner.additionalInfo,
      );

      // Signatures
      fillTextField(form, "sign2", formData.applicantSignature);

      // Financial Advisor Signature (NEW)
      fillTextField(form, "sign1", formData.financialAdvisor?.signature);
      fillTextField(form, "code1", formData.financialAdvisor?.code);
      fillTextField(
        form,
        "signd1",
        formatDate(formData.financialAdvisor?.signedDate),
      );

      // Proposed Insured Signature (if different from Applicant Owner)
      if (!formData.proposedInsured?.sameAsApplicant) {
        fillTextField(form, "sign_pi", formData.proposedInsured?.signature);
        fillTextField(
          form,
          "signd_pi",
          formatDate(formData.proposedInsured?.signatureDate),
        );
      }

      // Authorized Representative
      fillTextField(form, "name9", formData.authorizedRepresentative.name);
      fillTextField(
        form,
        "relation2",
        formData.authorizedRepresentative.relationship,
      );
      fillTextField(
        form,
        "sign11",
        formData.authorizedRepresentative.signature,
      );
      fillTextField(
        form,
        "signd3",
        formatDate(formData.authorizedRepresentative.date),
      );

      // Policy Receipt
      fillTextField(form, "pn5", formData.policyReceipt.policyNo);
      fillTextField(form, "sign12", formData.policyReceipt.signature);
      fillTextField(form, "signd4", formatDate(formData.policyReceipt.date));
      fillTextField(form, "time1", formData.policyReceipt.time);

      const remoteAppNumber = `REM-${new Date().getTime().toString().slice(-6)}`;
      fillTextField(form, "appn11", remoteAppNumber);
      fillTextField(
        form,
        "appn12",
        formData.remoteCommunication.productName || policyInfo.basePlan,
      );
      fillTextField(
        form,
        "date17",
        formatDate(formData.remoteCommunication.date),
      );
      fillTextField(form, "mode1", formData.remoteCommunication.mode);

      // Additional Conditions
      additionalConditions.forEach((condition, index) => {
        if (index === 0) {
          fillTextField(form, "qno1", condition.questionNo);
          fillTextField(form, "name10", condition.nameOfPerson);
          fillTextField(form, "diag1", condition.diagnosis);
          fillTextField(form, "do1", condition.dateOfOnset);
          fillTextField(form, "fs1", condition.frequencySeverity);
          fillTextField(form, "mtr1", condition.medicalTestResults);
          fillTextField(form, "tx1", condition.treatment);
          fillTextField(form, "cs1", condition.currentStatus);
        } else if (index === 1) {
          fillTextField(form, "qno2", condition.questionNo);
          fillTextField(form, "name11", condition.nameOfPerson);
          fillTextField(form, "diag2", condition.diagnosis);
          fillTextField(form, "do2", condition.dateOfOnset);
          fillTextField(form, "fs2", condition.frequencySeverity);
          fillTextField(form, "mtr2", condition.medicalTestResults);
          fillTextField(form, "tx2", condition.treatment);
          fillTextField(form, "cs2", condition.currentStatus);
        } else if (index === 2) {
          fillTextField(form, "qno3", condition.questionNo);
          fillTextField(form, "name12", condition.nameOfPerson);
          fillTextField(form, "diag3", condition.diagnosis);
          fillTextField(form, "do3", condition.dateOfOnset);
          fillTextField(form, "fs3", condition.frequencySeverity);
          fillTextField(form, "mtr3", condition.medicalTestResults);
          fillTextField(form, "tx3", condition.treatment);
          fillTextField(form, "cs3", condition.currentStatus);
        }
      });

      console.log("PDF generation completed, saving...");
      const filledPdfBytes = await pdfDoc.save();
      downloadPDF(filledPdfBytes, `IHP-${formData.lastName || "Form"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed. Check console for details.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = [
      "lastName",
      "firstName",
      "dob",
      "gender",
      "nationality",
      "usPerson",
    ];
    if (required.some((field) => !formData[field])) {
      alert("Please fill all required fields");
      return;
    }
    if (window.confirm("Form submitted! Generate PDF?")) generatePDF();
  };

  return (
    <form onSubmit={handleSubmit} className="big-card">
      <div className="big-card-header">
        <h2>Application for Health Insurance</h2>
        <p>Allianz PNB Life Insurance, Inc.</p>
      </div>

      <div className="big-card-body">
        {/* Section A: Applicant Information */}
        <FormSection title="A. APPLICANT OWNER INFORMATION">
          <div className="form-grid">
            <FormInput
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(v) => handleChange("lastName", v)}
            />
            <FormInput
              label="First Name"
              required
              value={formData.firstName}
              onChange={(v) => handleChange("firstName", v)}
            />
            <FormInput
              label="Middle Name"
              value={formData.middleName}
              onChange={(v) => handleChange("middleName", v)}
            />
            <FormInput
              label="Suffix"
              value={formData.suffix}
              onChange={(v) => handleChange("suffix", v)}
            />
          </div>

          <FormInput
            label="Other Legal Name"
            value={formData.otherLegalName}
            onChange={(v) => handleChange("otherLegalName", v)}
          />
          <br></br>
          <div className="form-grid">
            <FormInput
              label="Place of Birth"
              value={formData.placeOfBirth}
              onChange={(v) => handleChange("placeOfBirth", v)}
            />
            <FormInput
              label="Nationality"
              required
              value={formData.nationality}
              onChange={(v) => handleChange("nationality", v)}
            />
            <FormSelect
              label="Are you a US Person?"
              required
              value={formData.usPerson}
              onChange={(v) => handleChange("usPerson", v)}
              options={[
                { value: "", label: "Select" },
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
              ]}
            />
          </div>

          <div className="form-grid">
            <FormInput
              type="date"
              label="Date of Birth"
              required
              value={formData.dob}
              onChange={(v) => handleChange("dob", v)}
            />
            <FormSelect
              label="Gender"
              required
              value={formData.gender}
              onChange={(v) => handleChange("gender", v)}
              options={[
                { value: "", label: "Select" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
            />
            <FormSelect
              label="Civil Status"
              value={formData.civilStatus}
              onChange={(v) => handleChange("civilStatus", v)}
              options={[
                { value: "", label: "Select" },
                { value: "Single", label: "Single" },
                { value: "Married", label: "Married" },
                { value: "Widowed", label: "Widowed" },
                { value: "Divorced", label: "Divorced" },
                { value: "Separated", label: "Separated" },
                { value: "Annulled", label: "Annulled" },
              ]}
            />
          </div>

          <div className="form-grid">
            <FormInput
              label="Country of Residence"
              value={formData.countryOfResidence}
              onChange={(v) => handleChange("countryOfResidence", v)}
            />
            <FormInput
              type="number"
              label="Duration of Stay (Months)"
              value={formData.durationOfStay}
              onChange={(v) => handleChange("durationOfStay", v)}
            />
            <FormInput
              label="TIN / SSS / GSIS No."
              value={formData.tin}
              onChange={(v) => handleChange("tin", v)}
            />
          </div>

          <AddressSection
            title="Present Address"
            prefix="presentAddress"
            data={formData.presentAddress}
            onChange={handleNestedChange}
          />

          <WorkInformationSection
            data={formData.workInformation}
            onChange={handleNestedChange}
          />

          <RadioGroup
            label="Preferred Mailing Address"
            name="preferredMailingAddress"
            value={formData.preferredMailingAddress}
            onChange={(v) => handleChange("preferredMailingAddress", v)}
            options={[
              { value: "Present", label: "Present Address" },
              { value: "Work", label: "Work Address" },
            ]}
          />

          <ContactSection
            data={formData.contactInformation}
            onChange={handleNestedChange}
          />

          <CheckboxGroup
            label="Source of Funds"
            options={[
              { key: "business", label: "Business" },
              { key: "salaryCommission", label: "Salary/Commission" },
              {
                key: "donationsContributions",
                label: "Donations/Contributions",
              },
              {
                key: "remittancesAllowancesPension",
                label: "Remittances/Allowances/Pension",
              },
              { key: "investments", label: "Investments" },
              { key: "others", label: "Others" },
            ]}
            values={formData.sourceOfFunds}
            onChange={(key) =>
              handleChange(`sourceOfFunds.${key}`, !formData.sourceOfFunds[key])
            }
          />

          <ContingentOwnerSection
            data={formData.contingentOwner}
            onChange={handleNestedChange}
          />

          <CurrentInsuranceSection
            data={formData.currentInsurance}
            onChange={(f, v) => handleNestedChange("currentInsurance", f, v)}
          />
        </FormSection>

        {/* Section B: Plan Information */}
        <FormSection title="B. PLAN INFORMATION">
          <PlanInfoSection data={policyInfo} onChange={setPolicyInfo} />
        </FormSection>

        {/* Section C: Proposed Insured */}
        <FormSection title="C. PROPOSED INSURED">
          <ProposedInsuredSection
            data={formData.proposedInsured}
            onChange={handleNestedChange}
          />
        </FormSection>

        {/* Section D: Dependents */}
        <FormSection title="D. DEPENDENT INFORMATION">
          <DependentSection
            dependents={dependents}
            onDependentChange={handleDependentChange}
            onAdd={addDependent}
            onRemove={removeDependent}
          />
        </FormSection>

        {/* Section E: Health Declaration */}
        <FormSection title="E. HEALTH DECLARATION">
          <HealthDeclarationSection
            formData={formData}
            dependents={dependents}
            healthQuestions={healthQuestions}
            additionalConditions={additionalConditions}
            onHealthChange={handleChange}
            onHealthQuestionChange={handleHealthQuestionChange}
            onAdditionalConditionChange={handleAdditionalConditionChange}
            onAddCondition={addAdditionalCondition}
            onRemoveCondition={removeAdditionalCondition}
            onDependentHealthChange={handleDependentChange}
            illnessOptions={ILLNESS_OPTIONS}
          />
        </FormSection>

        {/* Section F: General Declaration */}
        <FormSection title="F. GENERAL DECLARATION">
          <CheckboxField
            label="I further authorize Allianz PNB Life Insurance, Inc. to share, transfer and/or disclose my information to any of its subsidiaries, affiliates, and partners for offer of related products and services."
            checked={formData.authorizeInfoSharing}
            onChange={(v) => handleChange("authorizeInfoSharing", v)}
          />
        </FormSection>

        {/* Section G: Signatures */}
        <FormSection title="G. SIGNATURES">
          <SignatureSection
            data={formData}
            onChange={handleChange}
            onNestedChange={handleNestedChange}
          />
        </FormSection>

        {/* Section H: Authorization */}
        <FormSection title="H. AUTHORIZATION">
          <AuthorizationSection data={formData} onChange={handleNestedChange} />
        </FormSection>

        {/* Action Buttons */}
        <div className="btn-group">
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleAutoFill}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Auto Fill
            </button>
            <TestPDFButton onTest={testPDFFilling} />
            <ResetButton />
          </div>
          <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
            <PDFButton onGenerate={generatePDF} />
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  );
}

// Reusable Components
const FormInput = ({
  label,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
  ...props
}) => (
  <div className="form-group">
    <label>
      {label}
      {required && <span className="required">*</span>}
    </label>
    <input
      type={type}
      required={required}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || ""}
      {...props}
    />
  </div>
);

const FormSelect = ({ label, required, value, onChange, options }) => (
  <div className="form-group">
    <label>
      {label}
      {required && <span className="required">*</span>}
    </label>
    <select
      required={required}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const RadioGroup = ({ label, name, value, onChange, options }) => (
  <>
    <h4>{label}</h4>
    <div className="form-grid">
      {options.map((opt) => (
        <div className="form-group" key={opt.value}>
          <label>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
            />{" "}
            {opt.label}
          </label>
        </div>
      ))}
    </div>
  </>
);

const CheckboxGroup = ({ label, options, values, onChange }) => (
  <>
    <h4>{label}</h4>
    <div className="form-grid">
      {options.map(({ key, label }) => (
        <div className="form-group" key={key}>
          <label>
            <input
              type="checkbox"
              checked={values[key] || false}
              onChange={() => onChange(key)}
            />{" "}
            {label}
          </label>
        </div>
      ))}
    </div>
  </>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <div
    style={{
      marginBottom: "20px",
      padding: "20px",
      border: "1px solid #e5e7eb",
      borderRadius: "5px",
      backgroundColor: "#f9f9f9",
    }}
  >
    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <strong>I further authorize Allianz PNB Life Insurance, Inc.</strong>{" "}
        {label}
      </span>
    </label>
  </div>
);

export default IHPForm;
