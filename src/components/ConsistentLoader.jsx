import { createPortal } from "react-dom";

const ConsistentLoader = ({ size = 40, fullScreen = true }) => {
  const loader = (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      border: `${size === 40 ? '4px' : '3px'} solid #f3f4f6`,
      borderTop: `${size === 40 ? '4px' : '3px'} solid #003781`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
  );

  const style = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  if (fullScreen) {
    return createPortal(
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        zIndex: 999999,
      }}>
        {loader}
        <style>{style}</style>
      </div>,
      document.body
    );
  }

  return (
    <>
      {loader}
      <style>{style}</style>
    </>
  );
};

export default ConsistentLoader;