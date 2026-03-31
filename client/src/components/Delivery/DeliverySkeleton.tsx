import React from 'react';

interface BoneProps {
  w?: string;
  h?: number;
  r?: number;
  mb?: number;
  dark?: boolean;
}

export const Bone: React.FC<BoneProps> = ({ w = '100%', h = 16, r = 8, mb = 0, dark = false }) => (
  <div style={{
    width: w, height: h, borderRadius: r, marginBottom: mb, flexShrink: 0,
    background: dark
      ? 'linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%)'
      : 'linear-gradient(90deg,#f0f0f2 25%,#e8e8ea 50%,#f0f0f2 75%)',
    backgroundSize: '200% 100%',
    animation: 'bone-shimmer 1.4s infinite',
  }} />
);

// Single order card skeleton
export const OrderCardSkeleton: React.FC<{ dark?: boolean; surface?: string; border?: string }> = ({
  dark = false, surface = '#fff', border = '#f0f0f2',
}) => (
  <div style={{ background: surface, borderRadius: 18, border: `1px solid ${border}`, overflow: 'hidden', padding: '14px 16px' }}>
    {/* Top row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <Bone w="100px" h={14} r={6} dark={dark} />
          <Bone w="48px" h={14} r={20} dark={dark} />
        </div>
        <Bone w="130px" h={13} r={6} dark={dark} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <Bone w="80px" h={22} r={20} dark={dark} />
        <Bone w="55px" h={13} r={6} dark={dark} />
      </div>
    </div>
    {/* Address row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
      <Bone w="60%" h={12} r={6} dark={dark} />
      <Bone w="20%" h={12} r={6} dark={dark} />
    </div>
    {/* Tags row */}
    <div style={{ display: 'flex', gap: 6 }}>
      <Bone w="70px" h={24} r={8} dark={dark} />
      <Bone w="90px" h={24} r={8} dark={dark} />
    </div>
    {/* Action bar */}
    <div style={{ borderTop: `1px solid ${border}`, marginTop: 12, paddingTop: 10, display: 'flex', gap: 6 }}>
      <Bone w="56px" h={30} r={9} dark={dark} />
      <Bone w="80px" h={30} r={9} dark={dark} />
      <Bone w="64px" h={30} r={9} dark={dark} />
      <div style={{ flex: 1 }} />
      <Bone w="72px" h={30} r={9} dark={dark} />
    </div>
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton: React.FC<{ dark?: boolean; surface?: string; border?: string }> = ({
  dark = false, surface = '#fff', border = '#f0f0f2',
}) => (
  <div>
    {/* Greeting banner */}
    <div style={{ background: dark ? '#1e293b' : '#f0f4f8', borderRadius: 20, padding: '20px', marginBottom: 16 }}>
      <Bone w="80px" h={11} r={6} mb={8} dark={dark} />
      <Bone w="160px" h={22} r={8} mb={14} dark={dark} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Bone w="90px" h={28} r={10} dark={dark} />
        <Bone w="80px" h={28} r={10} dark={dark} />
        <Bone w="70px" h={28} r={10} dark={dark} />
      </div>
    </div>
    {/* Earnings + quick actions */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 16 }}>
        <Bone w="32px" h={32} r={10} mb={10} dark={dark} />
        <Bone w="80px" h={24} r={6} mb={6} dark={dark} />
        <Bone w="55px" h={11} r={6} dark={dark} />
      </div>
      <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 16 }}>
        <Bone w="60%" h={11} r={6} mb={12} dark={dark} />
        <Bone w="90%" h={13} r={6} mb={8} dark={dark} />
        <Bone w="80%" h={13} r={6} dark={dark} />
      </div>
    </div>
    {/* Stat cards */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 16 }}>
          <Bone w="40px" h={40} r={12} mb={10} dark={dark} />
          <Bone w="50px" h={28} r={6} mb={6} dark={dark} />
          <Bone w="80px" h={11} r={6} dark={dark} />
        </div>
      ))}
    </div>
    {/* Search */}
    <Bone h={42} r={12} mb={16} dark={dark} />
    {/* CTA */}
    <Bone h={50} r={14} dark={dark} />
  </div>
);

// Order detail skeleton
export const OrderDetailSkeleton: React.FC<{ dark?: boolean; surface?: string; border?: string }> = ({
  dark = false, surface = '#fff', border = '#f0f0f2',
}) => {
  const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 16, marginBottom: 12 }}>
      {children}
    </div>
  );
  return (
    <div>
      {/* Back */}
      <Bone w="120px" h={14} r={6} mb={16} dark={dark} />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Bone w="130px" h={22} r={6} mb={6} dark={dark} />
          <Bone w="90px" h={12} r={6} dark={dark} />
        </div>
        <Bone w="90px" h={26} r={20} dark={dark} />
      </div>
      {/* Timeline */}
      <Card>
        <Bone w="80px" h={10} r={6} mb={14} dark={dark} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[0, 1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <Bone w="28px" h={28} r={50} dark={dark} />
              {i < 3 && <div style={{ flex: 1, height: 2, background: dark ? '#263348' : '#f0f0f2', borderRadius: 2 }} />}
            </React.Fragment>
          ))}
        </div>
      </Card>
      {/* Customer */}
      <Card>
        <Bone w="70px" h={10} r={6} mb={12} dark={dark} />
        <Bone w="140px" h={16} r={6} mb={12} dark={dark} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Bone w="100px" h={32} r={50} dark={dark} />
          <Bone w="110px" h={32} r={50} dark={dark} />
        </div>
      </Card>
      {/* Address */}
      <Card>
        <Bone w="70px" h={10} r={6} mb={12} dark={dark} />
        <Bone w="90%" h={13} r={6} mb={6} dark={dark} />
        <Bone w="70%" h={13} r={6} mb={12} dark={dark} />
        <Bone w="110px" h={32} r={50} dark={dark} />
      </Card>
      {/* Items */}
      <Card>
        <Bone w="80px" h={10} r={6} mb={12} dark={dark} />
        {[0, 1].map(i => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i === 0 ? 12 : 0 }}>
            <Bone w="42px" h={42} r={8} dark={dark} />
            <div style={{ flex: 1 }}>
              <Bone w="70%" h={13} r={6} mb={6} dark={dark} />
              <Bone w="50%" h={11} r={6} dark={dark} />
            </div>
          </div>
        ))}
      </Card>
      {/* Action button */}
      <Bone h={52} r={14} dark={dark} />
    </div>
  );
};

export const SHIMMER_CSS = `@keyframes bone-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
