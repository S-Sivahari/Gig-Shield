import React, { useRef } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Upload } from 'lucide-react';

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export const Step2Identity: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const fileInputRefAadhaar = useRef<HTMLInputElement>(null);
  const fileInputRefDL = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 12);
    // Format as XXXX XXXX XXXX
    val = val.replace(/(.{4})/g, '$1 ').trim();
    updateData({ aadhaarNumber: val });
  };

  return (
    <form className="gs-step-form" onSubmit={handleSubmit}>
      <div className="gs-step-fields">
        <Input 
          label="Aadhaar number"
          placeholder="XXXX XXXX XXXX"
          value={data.aadhaarNumber || ''}
          onChange={handleAadhaarChange}
          maxLength={14}
          required
        />
        
        <div className="gs-input-container">
          <label className="gs-form-label">Upload Aadhaar (Front & Back)</label>
          <div 
            className="gs-upload-box gs-upload-box--blue"
            onClick={() => fileInputRefAadhaar.current?.click()}
          >
            <Upload className="gs-upload-icon" size={24} />
            <span className="gs-upload-text">Tap to upload Document</span>
            <span className="gs-upload-hint">JPG PNG PDF · max 5MB</span>
            <input 
              type="file" 
              ref={fileInputRefAadhaar} 
              style={{ display: 'none' }} 
              accept=".jpg,.jpeg,.png,.pdf"
            />
          </div>
        </div>

        <Input 
          label="Driving license number"
          placeholder="e.g. RJ06 20110012345"
          value={data.dlNumber || ''}
          onChange={(e) => updateData({ dlNumber: e.target.value })}
          required
        />

        <div className="gs-input-container">
          <label className="gs-form-label">Upload Driving License</label>
          <div 
            className="gs-upload-box"
            onClick={() => fileInputRefDL.current?.click()}
          >
            <Upload className="gs-upload-icon" size={24} />
            <span className="gs-upload-text">Tap to upload Document</span>
            <span className="gs-upload-hint">JPG PNG PDF · max 5MB</span>
            <input 
              type="file" 
              ref={fileInputRefDL} 
              style={{ display: 'none' }} 
              accept=".jpg,.jpeg,.png,.pdf"
            />
          </div>
        </div>
      </div>

      <div className="gs-step-footer">
        <Button type="submit" variant="primary">
          Next — work profile
        </Button>
      </div>
    </form>
  );
};
