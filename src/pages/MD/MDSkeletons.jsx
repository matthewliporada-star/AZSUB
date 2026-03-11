// MDSkeletons.jsx - Loading skeleton components for MD pages
import React from 'react';
import MDLayout from './MDLayout';
import './MDSkeletons.css';

// Reusable parts
const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton skeleton-label"></div>
        <div className="skeleton skeleton-value"></div>
        <div className="skeleton skeleton-subtext"></div>
    </div>
);

const SkeletonTableRow = () => (
    <div className="skeleton-table-row">
        <div className="skeleton" style={{ width: '40px', height: '20px' }}></div>
        <div className="skeleton" style={{ width: '20%', height: '20px' }}></div>
        <div className="skeleton" style={{ width: '15%', height: '20px' }}></div>
        <div className="skeleton" style={{ width: '15%', height: '20px' }}></div>
        <div className="skeleton" style={{ width: '10%', height: '20px' }}></div>
        <div className="skeleton" style={{ width: '10%', height: '20px' }}></div>
        <div className="skeleton" style={{ flex: 1, height: '30px' }}></div>
    </div>
);

// Dashboard Skeleton
export const DashboardSkeleton = () => (
    <MDLayout title="Dashboard">
        <div className="md-dashboard-content">
            {/* Stat Cards */}
            <div className="skeleton-dashboard-grid">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>

            <div className="skeleton-dashboard-grid">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>

            {/* Charts */}
            <div className="skeleton-charts-grid">
                <div className="skeleton skeleton-chart"></div>
                <div className="skeleton skeleton-chart"></div>
            </div>

            {/* Table */}
            <div className="skeleton-table-container">
                <div className="skeleton skeleton-table-header"></div>
                {[1, 2, 3, 4, 5].map(i => <SkeletonTableRow key={i} />)}
            </div>
        </div>
    </MDLayout>
);

// MP Page Skeleton
export const MPPageSkeleton = () => (
    <MDLayout title="Management Partners">
        <div className="md-dashboard-content">
            <div className="skeleton skeleton-header-title"></div>

            <div className="skeleton skeleton-filter-bar"></div>

            <div className="skeleton-dashboard-grid">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>

            <div className="skeleton-table-container">
                <div className="skeleton skeleton-table-header"></div>
                {[1, 2, 3, 4, 5, 6, 7].map(i => <SkeletonTableRow key={i} />)}
            </div>
        </div>
    </MDLayout>
);

// AL Page Skeleton
export const ALPageSkeleton = () => (
    <MDLayout title="Agency Leaders">
        <div className="md-dashboard-content">
            <div className="skeleton skeleton-header-title"></div>

            <div className="skeleton skeleton-filter-bar"></div>

            <div className="skeleton-dashboard-grid">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>

            <div className="skeleton-table-container">
                <div className="skeleton skeleton-table-header"></div>
                {[1, 2, 3, 4, 5, 6, 7].map(i => <SkeletonTableRow key={i} />)}
            </div>
        </div>
    </MDLayout>
);

// AP Page Skeleton
export const APPageSkeleton = () => (
    <MDLayout title="Agency Partners">
        <div className="md-dashboard-content">
            <div className="skeleton skeleton-header-title"></div>

            <div className="skeleton skeleton-filter-bar"></div>

            <div className="skeleton-dashboard-grid">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>

            <div className="skeleton-table-container">
                <div className="skeleton skeleton-table-header"></div>
                {[1, 2, 3, 4, 5, 6, 7].map(i => <SkeletonTableRow key={i} />)}
            </div>
        </div>
    </MDLayout>
);