const DisplayPair = ({ label, value, isLongText }) => {
    return (
      <div className="input-pair">
        <label>{label}</label>
        <div className={isLongText ? 'display-long-text' : 'display-value'}>
          {value}
        </div>
      </div>
    );
  };
  
  export default DisplayPair;
  