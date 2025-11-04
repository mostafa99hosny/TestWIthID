import React from 'react';
import { ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  backLabel?: string;
  nextDisabled?: boolean;
  nextIcon?: React.ComponentType<any>;
  showBack?: boolean;
  showSubmitNow?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  nextLabel,
  backLabel = "Back",
  nextDisabled = false,
  nextIcon: NextIcon = ChevronRight,
  showBack = true,
  showSubmitNow = false
}) => {
  return (
    <div className={`flex ${showBack ? 'justify-between' : 'justify-end'} pt-4 gap-4`}>
      {showBack && onBack && (
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          {backLabel}
        </button>
      )}
      
      <div className="flex gap-4">
        {/* Save and Submit Now button - only shown when showSubmitNow is true */}
        {showSubmitNow && (
          <button
            disabled={true}
            className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold flex items-center gap-2 cursor-not-allowed transition-colors"
          >
            Save and Submit Now
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        
        {/* Existing button renamed to Save and Submit Later */}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
            !nextDisabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {nextLabel}
          <NextIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NavigationButtons;