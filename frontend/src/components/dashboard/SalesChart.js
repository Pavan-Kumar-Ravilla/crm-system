// src/components/dashboard/SalesChart.js
import React from 'react';
import { TrendingUp } from 'lucide-react';

const SalesChart = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="slds-card">
        <div className="slds-card__header slds-grid">
          <header className="slds-media slds-media_center slds-has-flexi-truncate">
            <div className="slds-media__figure">
              <span className="slds-icon_container slds-icon-standard-sales-path">
                <TrendingUp size={20} />
              </span>
            </div>
            <div className="slds-media__body">
              <h2 className="slds-card__header-title">
                <span className="slds-text-heading_small">Sales Performance</span>
              </h2>
            </div>
          </header>
        </div>
        <div className="slds-card__body slds-card__body_inner">
          <div className="slds-text-align_center slds-p-vertical_large">
            <TrendingUp size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
            <p className="slds-text-heading_small slds-m-top_small">No data available</p>
            <p className="slds-text-color_weak">Sales data will appear here once available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate max values for scaling
  const maxLeads = Math.max(...data.map(d => d.leads));
  const maxOpportunities = Math.max(...data.map(d => d.opportunities));
  const maxRevenue = Math.max(...data.map(d => d.revenue));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="slds-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__figure">
            <span className="slds-icon_container slds-icon-standard-sales-path">
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span className="slds-text-heading_small">Sales Performance</span>
            </h2>
            <p className="slds-card__header-meta">
              <span className="slds-text-body_small slds-text-color_weak">Last 12 months</span>
            </p>
          </div>
        </header>
        <div className="slds-no-flex">
          <div className="slds-grid slds-grid_align-center">
            <div className="slds-grid slds-grid_vertical slds-grid_align-center slds-m-right_medium">
              <div className="slds-grid slds-grid_align-center">
                <div className="slds-color-picker__swatch" style={{ backgroundColor: '#0176d3', width: '12px', height: '12px', marginRight: '6px' }}></div>
                <span className="slds-text-body_small">Leads</span>
              </div>
            </div>
            <div className="slds-grid slds-grid_vertical slds-grid_align-center slds-m-right_medium">
              <div className="slds-grid slds-grid_align-center">
                <div className="slds-color-picker__swatch" style={{ backgroundColor: '#2e844a', width: '12px', height: '12px', marginRight: '6px' }}></div>
                <span className="slds-text-body_small">Opportunities</span>
              </div>
            </div>
            <div className="slds-grid slds-grid_vertical slds-grid_align-center">
              <div className="slds-grid slds-grid_align-center">
                <div className="slds-color-picker__swatch" style={{ backgroundColor: '#ff8a3c', width: '12px', height: '12px', marginRight: '6px' }}></div>
                <span className="slds-text-body_small">Revenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="slds-card__body slds-card__body_inner">
        <div className="slds-grid slds-grid_vertical" style={{ height: '300px' }}>
          {/* Simple Bar Chart */}
          <div className="slds-grid slds-grid_align-end" style={{ height: '240px', padding: '1rem 0' }}>
            {data.map((month, index) => (
              <div key={index} className="slds-col slds-text-align_center" style={{ margin: '0 2px' }}>
                <div className="slds-grid slds-grid_vertical slds-grid_align-end" style={{ height: '200px' }}>
                  {/* Revenue Bar */}
                  <div 
                    className="slds-m-bottom_xx-small"
                    style={{ 
                      width: '100%',
                      height: `${(month.revenue / maxRevenue) * 60}px`,
                      backgroundColor: '#ff8a3c',
                      borderRadius: '2px 2px 0 0',
                      minHeight: '2px'
                    }}
                    title={`Revenue: ${formatCurrency(month.revenue)}`}
                  ></div>
                  {/* Opportunities Bar */}
                  <div 
                    className="slds-m-bottom_xx-small"
                    style={{ 
                      width: '100%',
                      height: `${(month.opportunities / maxOpportunities) * 60}px`,
                      backgroundColor: '#2e844a',
                      borderRadius: '2px 2px 0 0',
                      minHeight: '2px'
                    }}
                    title={`Opportunities: ${month.opportunities}`}
                  ></div>
                  {/* Leads Bar */}
                  <div 
                    style={{ 
                      width: '100%',
                      height: `${(month.leads / maxLeads) * 60}px`,
                      backgroundColor: '#0176d3',
                      borderRadius: '2px 2px 0 0',
                      minHeight: '2px'
                    }}
                    title={`Leads: ${month.leads}`}
                  ></div>
                </div>
                <div className="slds-text-body_small slds-text-color_weak slds-m-top_x-small">
                  {month.month}
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Stats */}
          <div className="slds-grid slds-gutters slds-m-top_medium">
            <div className="slds-col slds-size_1-of-3 slds-text-align_center">
              <div className="slds-text-heading_medium slds-text-color_default">
                {data.reduce((sum, month) => sum + month.leads, 0).toLocaleString()}
              </div>
              <div className="slds-text-body_small slds-text-color_weak">Total Leads</div>
            </div>
            <div className="slds-col slds-size_1-of-3 slds-text-align_center">
              <div className="slds-text-heading_medium slds-text-color_default">
                {data.reduce((sum, month) => sum + month.opportunities, 0).toLocaleString()}
              </div>
              <div className="slds-text-body_small slds-text-color_weak">Total Opportunities</div>
            </div>
            <div className="slds-col slds-size_1-of-3 slds-text-align_center">
              <div className="slds-text-heading_medium slds-text-color_default">
                {formatCurrency(data.reduce((sum, month) => sum + month.revenue, 0))}
              </div>
              <div className="slds-text-body_small slds-text-color_weak">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;