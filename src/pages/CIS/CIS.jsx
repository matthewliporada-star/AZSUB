import React from "react";
import "./CIS.css";

// Components
import Header from "./components/Header";
import Notice from "./components/Notice";
import PrintBar from "./components/PrintBar";

// Sections
import PersonalInformation from "./sections/PersonalInformation/PersonalInformation";
import TravelDetails from "./sections/TravelDetails/TravelDetails";
import SmokingAlcohol from "./sections/Habits/SmokingAlcohol";
import MedicalDetails from "./sections/Medical/MedicalDetails";
import Insurance from "./sections/ExistingPending/Insurance";
import BusinessEmployment from "./sections/BusinessEmployment/BusinessEmployment";
import IncomeStatement from "./sections/PersonalIncome/IncomeStatement";
import AssetsLiabilities from "./sections/AssetsLiabilities/AssetsLiabilities";
import PropertyDetails from "./sections/PropertyDetails/PropertyDetails";
import BankDetails from "./sections/BankDetails/BankDetails";
import PolicyBeneficiary from "./sections/PolicyBeneficiary/PolicyBeneficiary";
import SpouseDetails from "./sections/Spouse/SpouseDetails";
import DependentDetails from "./sections/Dependent/DependentDetails";

export default function App() {
  return (
    <div className="page-wrapper">
      <Header />
      <Notice />
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: "60%" }}></div>
      </div>
      <PersonalInformation />
      <TravelDetails />
      <SmokingAlcohol />
      <MedicalDetails />
      <Insurance />
      <BusinessEmployment />
      <IncomeStatement />
      <AssetsLiabilities />
      <PropertyDetails />
      <BankDetails />
      <PolicyBeneficiary />
      <SpouseDetails />
      <DependentDetails />
      <PrintBar />
    </div>
  );
}
