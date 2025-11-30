// src/components/Logo.jsx
export default function Logo({ size = "normal", variant = "full" }) {
  const sizes = {
    small: { container: "2rem", text: "1rem" },
    normal: { container: "3rem", text: "1.5rem" },
    large: { container: "4rem", text: "2rem" },
    hero: { container: "6rem", text: "3rem" }
  };

  const currentSize = sizes[size] || sizes.normal;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Logo Icon */}
      <div style={{
        width: currentSize.container,
        height: currentSize.container,
        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Building Icon */}
        <svg 
          width={size === 'hero' ? '48' : size === 'large' ? '32' : size === 'small' ? '16' : '24'} 
          height={size === 'hero' ? '48' : size === 'large' ? '32' : size === 'small' ? '16' : '24'} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 21h18" />
          <path d="M9 8h1" />
          <path d="M9 12h1" />
          <path d="M9 16h1" />
          <path d="M14 8h1" />
          <path d="M14 12h1" />
          <path d="M14 16h1" />
          <path d="M6 3v18" />
          <path d="M18 3v18" />
          <path d="M6 3h12" />
        </svg>
      </div>
      
      {/* Company Name */}
      {variant === 'full' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontSize: currentSize.text, 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.2'
          }}>
            Retro
          </span>
          <span style={{ 
            fontSize: `calc(${currentSize.text} * 0.5)`,
            color: '#64748b',
            fontWeight: '500',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Property Management
          </span>
        </div>
      )}
    </div>
  );
}
