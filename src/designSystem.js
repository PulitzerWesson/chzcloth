// CHZCLOTH Design System
// Clean, professional design tokens

export const colors = {
  // Background
  bg: {
    primary: '#0a0f1a',
    secondary: '#0d1929',
    card: 'rgba(255,255,255,0.03)',
    cardHover: 'rgba(255,255,255,0.05)',
    input: 'rgba(255,255,255,0.05)',
  },
  
  // Borders
  border: {
    default: 'rgba(255,255,255,0.1)',
    hover: 'rgba(255,255,255,0.2)',
    divider: 'rgba(255,255,255,0.05)',
  },
  
  // Text
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
    disabled: '#64748b',
    subtle: '#475569',
  },
  
  // Brand
  brand: {
    teal: '#2dd4bf',
    cyan: '#22d3ee',
    sky: '#7dd3fc',
  },
  
  // Status
  status: {
    success: '#22c55e',
    successMuted: '#86efac',
    warning: '#fbbf24',
    warningMuted: '#fde047',
    error: '#f87171',
    errorMuted: '#fca5a5',
    info: '#7dd3fc',
    purple: '#a78bfa',
  },
  
  // Semantic (badges, etc)
  semantic: {
    approved: '#86efac',
    approvedBg: 'rgba(134, 239, 172, 0.15)',
    approvedBorder: 'rgba(134, 239, 172, 0.3)',
    
    pending: '#fbbf24',
    pendingBg: 'rgba(251, 191, 36, 0.15)',
    pendingBorder: 'rgba(251, 191, 36, 0.3)',
    
    rejected: '#fca5a5',
    rejectedBg: 'rgba(252, 165, 165, 0.15)',
    rejectedBorder: 'rgba(252, 165, 165, 0.3)',
    
    ownIdea: '#2dd4bf',
    ownIdeaBg: 'rgba(45, 212, 191, 0.15)',
    ownIdeaBorder: 'rgba(45, 212, 191, 0.3)',
    
    tracking: '#fbbf24',
    trackingBg: 'rgba(251, 191, 36, 0.15)',
    trackingBorder: 'rgba(251, 191, 36, 0.3)',
  }
};

export const gradients = {
  brand: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
  brandButton: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
  yellow: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  blue: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)',
  purple: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
  
  // Stat cards
  statTeal: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(45, 212, 191, 0.05) 100%)',
  statYellow: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.05) 100%)',
  statGreen: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)',
  statBlue: 'linear-gradient(135deg, rgba(125, 211, 252, 0.2) 0%, rgba(125, 211, 252, 0.05) 100%)',
};

export const typography = {
  // Font sizes
  size: {
    xs: '0.75rem',
    sm: '0.85rem',
    base: '0.95rem',
    lg: '1.1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.75rem',
    '4xl': '2rem',
    '5xl': '2.5rem',
    '6xl': '3rem',
  },
  
  // Font weights
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Line heights
  leading: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '60px',
};

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  full: '9999px',
};

// Reusable component styles
export const components = {
  // Badges
  badge: (type = 'default') => {
    const variants = {
      approved: {
        color: colors.semantic.approved,
        background: colors.semantic.approvedBg,
        border: `1px solid ${colors.semantic.approvedBorder}`,
      },
      pending: {
        color: colors.semantic.pending,
        background: colors.semantic.pendingBg,
        border: `1px solid ${colors.semantic.pendingBorder}`,
      },
      rejected: {
        color: colors.semantic.rejected,
        background: colors.semantic.rejectedBg,
        border: `1px solid ${colors.semantic.rejectedBorder}`,
      },
      ownIdea: {
        color: colors.semantic.ownIdea,
        background: colors.semantic.ownIdeaBg,
        border: `1px solid ${colors.semantic.ownIdeaBorder}`,
      },
      tracking: {
        color: colors.semantic.tracking,
        background: colors.semantic.trackingBg,
        border: `1px solid ${colors.semantic.trackingBorder}`,
      },
      default: {
        color: colors.text.muted,
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${colors.border.default}`,
      }
    };
    
    return {
      ...variants[type],
      padding: '4px 12px',
      borderRadius: borderRadius.sm,
      fontSize: typography.size.xs,
      fontWeight: typography.weight.semibold,
      display: 'inline-block',
    };
  },
  
  // Stat cards
  statCard: (variant = 'default') => {
    const variants = {
      teal: {
        background: gradients.statTeal,
        border: `1px solid rgba(45, 212, 191, 0.2)`,
      },
      yellow: {
        background: gradients.statYellow,
        border: `1px solid rgba(251, 191, 36, 0.2)`,
      },
      green: {
        background: gradients.statGreen,
        border: `1px solid rgba(34, 197, 94, 0.2)`,
      },
      blue: {
        background: gradients.statBlue,
        border: `1px solid rgba(125, 211, 252, 0.2)`,
      },
      default: {
        background: colors.bg.card,
        border: `1px solid ${colors.border.default}`,
      }
    };
    
    return {
      ...variants[variant],
      borderRadius: borderRadius.xl,
      padding: spacing['2xl'],
      textAlign: 'center',
    };
  },
  
  // Cards
  card: {
    background: colors.bg.card,
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  
  // Buttons
  button: {
    primary: {
      background: gradients.brandButton,
      color: colors.bg.primary,
      border: 'none',
      borderRadius: borderRadius.lg,
      padding: `${spacing.md} ${spacing['2xl']}`,
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      cursor: 'pointer',
    },
    secondary: {
      background: colors.bg.input,
      color: colors.text.muted,
      border: `1px solid ${colors.border.default}`,
      borderRadius: borderRadius.md,
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      cursor: 'pointer',
    },
    ghost: {
      background: 'none',
      color: colors.text.muted,
      border: 'none',
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.size.sm,
      cursor: 'pointer',
    }
  },
  
  // Inputs
  input: {
    background: colors.bg.input,
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.md,
    padding: `${spacing.md} ${spacing.lg}`,
    color: colors.text.primary,
    fontSize: typography.size.base,
  }
};

// Helper function for score colors
export function getScoreColor(score) {
  if (score >= 80) return colors.status.success;
  if (score >= 60) return colors.brand.teal;
  if (score >= 40) return colors.status.warning;
  return colors.status.error;
}

// Helper for status labels
export const statusConfig = {
  succeeded: {
    label: '✓ Succeeded',
    color: colors.status.success,
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.3)',
  },
  partial: {
    label: '◐ Partial',
    color: colors.status.warning,
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.3)',
  },
  failed: {
    label: '✗ Failed',
    color: colors.status.error,
    bg: 'rgba(248, 113, 113, 0.15)',
    border: 'rgba(248, 113, 113, 0.3)',
  },
  inconclusive: {
    label: '? Inconclusive',
    color: colors.text.disabled,
    bg: 'rgba(100, 116, 139, 0.15)',
    border: 'rgba(100, 116, 139, 0.3)',
  },
  never_shipped: {
    label: '⊘ Never shipped',
    color: colors.text.subtle,
    bg: 'rgba(71, 85, 105, 0.15)',
    border: 'rgba(71, 85, 105, 0.3)',
  },
};
