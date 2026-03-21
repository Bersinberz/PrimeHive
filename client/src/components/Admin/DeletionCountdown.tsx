import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeletionCountdownProps {
  deletedAt: string;
  retentionDays?: number;
}

const DeletionCountdown: React.FC<DeletionCountdownProps> = ({ deletedAt, retentionDays = 30 }) => {
  const purgeDate = new Date(new Date(deletedAt).getTime() + retentionDays * 24 * 60 * 60 * 1000);
  const daysLeft = Math.max(0, Math.ceil((purgeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isCritical = daysLeft <= 7;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: isCritical ? 'rgba(239,68,68,0.08)' : 'rgba(107,114,128,0.08)',
      border: `1px solid ${isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.15)'}`,
      borderRadius: '20px', padding: '3px 10px',
    }}>
      <Trash2 size={11} color={isCritical ? '#ef4444' : '#9ca3af'} strokeWidth={2.5} />
      <span style={{
        fontSize: '0.68rem', fontWeight: 800,
        color: isCritical ? '#ef4444' : '#9ca3af',
        letterSpacing: '0.3px',
      }}>
        {daysLeft === 0 ? 'Purging soon' : `Purge in ${daysLeft}d`}
      </span>
    </div>
  );
};

export default DeletionCountdown;
