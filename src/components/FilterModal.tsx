import { useState } from 'react';
import './FilterModal.css';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterModalProps {
  title?: string;
  options: FilterOption[];
  selected: string[];
  onApply: (selected: string[]) => void;
  onClose: () => void;
}

function FilterModal({ title = 'Filtrele', options, selected, onApply, onClose }: FilterModalProps) {
  const [secili, setSecili] = useState<string[]>(selected);

  const toggle = (value: string) => {
    setSecili((mevcut) =>
      mevcut.includes(value) ? mevcut.filter((v) => v !== value) : [...mevcut, value]
    );
  };

  const handleTemizle = () => {
    setSecili([]);
  };

  const handleUygula = () => {
    onApply(secili);
    onClose();
  };

  return (
    <div className="filter-modal-backdrop" onClick={onClose}>
      <div className="filter-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>{title}</h3>
          <button type="button" className="filter-modal-kapat" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="filter-modal-options">
          {options.map((option) => (
            <label className="filter-option-row" key={option.value}>
              <input
                type="checkbox"
                checked={secili.includes(option.value)}
                onChange={() => toggle(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        <div className="filter-modal-actions">
          <button type="button" className="link-button" onClick={handleTemizle}>
            Temizle
          </button>
          <button type="button" className="submit-btn" onClick={handleUygula}>
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
