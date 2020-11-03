const buttonStyle = {
  display: 'block',
  margin: '5px',
  padding: '5px 10px',
  outline: 'none',
  verticalAlign: 'middle',
  fontSize: '14px',
  fontWeight: 'bold',
  lineHeight: '20px',
  userSelect: 'none',
  cursor: 'pointer',
}

export const lightButtonStyle = {
  color: '#000',
  backgroundColor: '#f7f7f7',
  ...buttonStyle,
}

export const darkButtonStyle = {
  color: '#f7f7f7',
  backgroundColor: '#000',
  ...buttonStyle,
}
