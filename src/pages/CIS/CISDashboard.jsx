import React, { useState } from 'react';
import { Search, Users, Send, Clock, XCircle } from 'lucide-react';
import './CIS.css';

const CISDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    {
      title: "TOTAL INQUIRIES",
      value: "124",
      subtext: "All-time inquiries",
      trend: "↑ 12.4%",
      icon: <Users size={24} />,
    },
    {
      title: "PDFS SENT",
      value: "86",
      subtext: "This Month",
      trend: "↑ 8.1%",
      icon: <Send size={24} />,
    },
    {
      title: "PENDING REVIEW",
      value: "12",
      subtext: "Awaiting Action",
      trend: "↓ 2.4%",
      icon: <Clock size={24} />,
    },
    {
      title: "DECLINED",
      value: "3",
      subtext: "0.0% Rate",
      trend: "↑ 1.1%",
      icon: <XCircle size={24} />,
    },
  ];

  // SAMPLE TABLE DATA
  const inquiries = [
    { id: 1, fullname: "Juan Dela Cruz", agent: "Agent Maria", date: "2026-03-08" },
    { id: 2, fullname: "Ana Santos", agent: "Agent Carlo", date: "2026-03-07" },
    { id: 3, fullname: "Mark Reyes", agent: "Agent John", date: "2026-03-06" },
    { id: 4, fullname: "Lisa Ramos", agent: "Agent Marie", date: "2026-03-05" },
  ];

  return (
    <div className="cis-container">
      <div className="cis-header">
        <h1 className="text-2xl font-bold text-slate-800">CIS Dashboard</h1>

        <div className="cis-search-wrapper">
          <Search className="cis-search-icon" />
          <input
            type="text"
            className="cis-search-input"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="cis-grid">
        {stats.map((stat, index) => (
          <div key={index} className="cis-card">
            <div className="cis-card-top">
              <div>
                <p className="cis-card-title">{stat.title}</p>
                <h2 className="cis-card-value">{stat.value}</h2>
              </div>
              <div className="cis-trend-badge">{stat.trend}</div>
            </div>

            <p className="cis-card-subtext">{stat.subtext}</p>

            <div className="cis-icon-bg">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="cis-table-container">
        <h2 className="cis-table-title">Recent Inquiries</h2>

        <table className="cis-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Agent Submitted</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.fullname}</td>
                <td>{item.agent}</td>
                <td>{item.date}</td>
                <td>
                  <button className="cis-action-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CISDashboard;