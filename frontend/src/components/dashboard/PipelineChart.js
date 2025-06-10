// src/components/dashboard/PipelineChart.js
import React from 'react';
import { Filter } from 'lucide-react';

const PipelineChart = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="slds-card">
        <div className="slds-card__header slds-grid">
          <header className="slds-media slds-media_center slds-has-flexi-truncate">
            <div className="slds-media__figure">
              <span className="slds-icon_container slds-icon-standard-opportunity">
                <Filter size={20} />
              </span>
            </div>
            <div className="slds-media__body">
              <h2 className="slds-card__header-title">
                <span className="slds-text-heading_small">Sales Pipeline</span>
              </h2>
            </div>
          </header>
        </div>
        <div className="slds-card__body slds-card__body_inner">
          <div className="slds-text-align_center slds-p-vertical_large">
            <Filter size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
            <p className="slds-text-heading_small slds-m-top_small">No pipeline data</p>
            <p className="slds-text-color_weak">Pipeline data will appear here once available</p>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = data.reduce((sum, stage) => sum + stage.amount, 0);
  const totalCount = data.reduce((sum, stage) => sum + stage.count, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStageColor = (index) => {
    const colors = [
      '#0176d3', // Blue
      '#2e844a', // Green
      '#ff8a3c', // Orange
      '#8b46ff', // Purple
      '#fe9339', // Light Orange
      '#06a59a'  // Teal
    ];
    return colors[index % colors.length];
  };

  const shortenStageName = (stage) => {
    const shortNames = {
      'Prospecting': 'Prospect',
      'Qualification': 'Qualify',
      'Needs Analysis': 'Analysis',
      'Value Proposition': 'Value Prop',
      'Id. Decision Makers': 'Decision',
      'Perception Analysis': 'Perception',
      'Proposal/Price Quote': 'Proposal',
      'Negotiation/Review': 'Negotiate',
      'Closed Won': 'Won',
      'Closed Lost': 'Lost'
    };
    return shortNames[stage] || stage;
  };

  return (
    <div className="slds-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__figure">
            <span className="slds-icon_container slds-icon-standard-opportunity">
              <Filter size={20} />
            </span>
          </div>
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span className="slds-text-heading_small">Sales Pipeline</span>
            </h2>
            <p className="slds-card__header-meta">
              <span className="slds-text-body_small slds-text-color_weak">Current opportunities by stage</span>
            </p>
          </div>
        </header>
      </div>
      <div className="slds-card__body slds-card__body_inner">
        <div className="slds-grid slds-grid_vertical" style={{ height: '300px' }}>
          {/* Pipeline Funnel */}
          <div className="slds-grid slds-grid_vertical slds-grid_align-center" style={{ height: '240px', padding: '1rem 0' }}>
            {data.map((stage, index) => {
              const percentage = totalAmount > 0 ? (stage.amount / totalAmount) * 100 : 0;
              const width = Math.max(percentage, 10); // Minimum width for visibility
              
              return (
                <div 
                  key={index} 
                  className="slds-m-bottom_x-small slds-text-align_center slds-relative"
                  style={{ width: '100%' }}
                >
                  <div 
                    className="slds-grid slds-grid_align-center slds-grid_vertical-align-center"
                    style={{ 
                      width: `${width}%`,
                      height: '32px',
                      backgroundColor: getStageColor(index),
                      borderRadius: '4px',
                      margin: '0 auto',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      position: 'relative',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                    title={`${stage.stage}: ${stage.count} opportunities, ${formatCurrency(stage.amount)}`}
                  >
                    <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center" style={{ width: '100%', padding: '0 0.5rem' }}>
                      <span>{shortenStageName(stage.stage)}</span>
                      <span>{stage.count}</span>
                    </div>
                  </div>
                  <div className="slds-text-body_small slds-text-color_weak slds-m-top_xx-small">
                    {formatCurrency(stage.amount)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pipeline Summary */}
          <div className="slds-grid slds-gutters slds-m-top_medium">
            <div className="slds-col slds-size_1-of-3 slds-text-align_center">
              <div className="slds-text-heading_medium slds-text-color_default">
                {totalCount}
              </div>
              <div className="slds-text-body_small slds-text-color_weak">Total Opportunities</div>
            </div>
            <div className="slds-col slds-size_1-of-3 slds-text-align_center">
              <div className="slds-text-heading_medium slds-text-color_default">
                {formatCurrency(totalAmount)}
              </div>
              <div className="slds-text-body_small slds-text-color_weak">Pipeline Value</div>
            </div>
            <div className="slds-col slds-size_1-of-3 slds-text-align_center">
              <div className="slds-text-heading_medium slds-text-color_default">
                {totalCount > 0 ? formatCurrency(totalAmount / totalCount) : '$0'}
              </div>
              <div className="slds-text-body_small slds-text-color_weak">Average Deal Size</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineChart;