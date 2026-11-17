export const PROMO_THEME_MAP = {
  orange: { accent: '#ff5510', grad: 'linear-gradient(135deg, #ff5510 0%, #ff8a3d 100%)' },
  navy: { accent: '#1e3a8a', grad: 'linear-gradient(135deg, #06183d 0%, #1e3a8a 100%)' },
  purple: { accent: '#6d5dfc', grad: 'linear-gradient(135deg, #6d5dfc 0%, #a78bfa 100%)' },
  green: { accent: '#059669', grad: 'linear-gradient(135deg, #047857 0%, #10b981 100%)' },
  red: { accent: '#dc2626', grad: 'linear-gradient(135deg, #b91c1c 0%, #f43f5e 100%)' },
};

export const PROMO_THEMES = Object.keys(PROMO_THEME_MAP);
export const getPromoTheme = (key) => PROMO_THEME_MAP[key] || PROMO_THEME_MAP.orange;
