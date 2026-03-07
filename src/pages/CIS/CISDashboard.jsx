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

  return (
    <div className="cis-container">
      <div className="cis-header">
        <h1 className="text-2xl font-bold text-slate-800">CIS Dashboard</h1>
        
        <div className="cis-search-wrapper">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="cis-search-input"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="cis-grid">
        {stats.map((stat, index) => (
          <div key={index} className="cis-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="cis-card-title">{stat.title}</p>
                <h2 className="cis-card-value">{stat.value}</h2>
              </div>
              <div className="cis-trend-badge">
                {stat.trend}
              </div>
            </div>
            
            <p className="cis-card-subtext">{stat.subtext}</p>
            
            <div className="cis-icon-bg">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CISDashboard;