const LoadingPage = () => {
  return (
    <div
      style={{
      position: 'fixed',
      inset: 0,
      background: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
     
    }}
    >
      <div
        style={{
          width: '1200px',
          height: '1920px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#333333',
          fontSize: '32px',
          fontWeight: 500,
          borderRadius: '12px',
          border: '1px solid #1a2a4a',
          boxShadow:
          '0 40px 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(0,0,0,0.05)',

        }}
      >
        Loading...
      </div>
    </div>
  )
}

export {LoadingPage}
