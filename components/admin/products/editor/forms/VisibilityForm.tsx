import React from 'react';
import { Switch } from '../../../../ui/Switch';

interface VisibilityFormProps {
    isPublished: boolean;
    isFeatured: boolean;
    onSwitchChange: (name: string, val: boolean) => void;
}

export const VisibilityForm: React.FC<VisibilityFormProps> = ({ isPublished, isFeatured, onSwitchChange }) => (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Publishing Status</h3>
        <div className="space-y-3">
            <Switch
                label="Visible in Shop"
                description="Hidden products are only visible to admins."
                checked={isPublished}
                onChange={(val) => onSwitchChange('isPublished', val)}
            />
            <Switch
                label="Featured Item"
                description="Pin this item to the homepage featured collection."
                checked={isFeatured}
                onChange={(val) => onSwitchChange('isFeatured', val)}
            />
        </div>
    </div>
);
