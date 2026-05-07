import React from 'react';
import { useTranslation } from 'react-i18next';
import './Differentiator.css';

const Differentiator = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      number: '01',
      title: t('differentiator.step1Title'),
      description: t('differentiator.step1Desc'),
      icon: '🔍'
    },
    {
      number: '02',
      title: t('differentiator.step2Title'),
      description: t('differentiator.step2Desc'),
      icon: '⚖️'
    },
    {
      number: '03',
      title: t('differentiator.step3Title'),
      description: t('differentiator.step3Desc'),
      icon: '📊'
    }
  ];

  return (
    <section className="differentiator">
      <div className="differentiator-container">
        <div className="differentiator-header">
          <div className="differentiator-badge">
            <span>{t('differentiator.badge')}</span>
          </div>
          <h2 className="differentiator-title text-glow">{t('differentiator.title')}</h2>
          <p className="differentiator-subtitle">
            {t('differentiator.subtitle')}
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step hover-lift">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="step-connector">
                  <div className="connector-line"></div>
                  <div className="connector-dot"></div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Differentiator;
