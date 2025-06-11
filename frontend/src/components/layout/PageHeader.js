import React from 'react';
import Button from '../ui/Button';

const PageHeader = ({
  title,
  subtitle,
  children,
  breadcrumbs = [],
  actions = []
}) => {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex mb-2" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <a
                  href={breadcrumb.href}
                  className={`
                    text-sm font-medium
                    ${index === breadcrumbs.length - 1
                      ? 'text-gray-500'
                      : 'text-gray-700 hover:text-primary-600'
                    }
                  `}
                >
                  {breadcrumb.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header content */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
          {children}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                size={action.size || 'md'}
                icon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;