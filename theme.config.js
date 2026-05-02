/** @type {const} */
const themeColors = {
  // Primary: Fresh Green (정상 상태, 주요 버튼)
  primary: { light: '#2ECC71', dark: '#27AE60' },
  // Secondary: Fresh Blue (보조 요소)
  secondary: { light: '#3498DB', dark: '#2980B9' },
  // Background
  background: { light: '#FFFFFF', dark: '#1A1A1A' },
  // Surface (카드, 엘리먼트)
  surface: { light: '#F8F9FA', dark: '#2D2D2D' },
  // Text
  foreground: { light: '#1A1A1A', dark: '#FFFFFF' },
  muted: { light: '#666666', dark: '#AAAAAA' },
  // Border
  border: { light: '#E0E0E0', dark: '#404040' },
  // Status Colors
  success: { light: '#27AE60', dark: '#2ECC71' },     // 정상 (7일 이상)
  warning: { light: '#F39C12', dark: '#E67E22' },     // 임박 (3-6일)
  error: { light: '#E74C3C', dark: '#C0392B' },       // 만료 (0일 이하)
};

module.exports = { themeColors };
