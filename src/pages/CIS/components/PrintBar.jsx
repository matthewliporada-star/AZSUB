function PrintBar() {

  const handleReset = () => {
    if (confirm("Clear all fields and start over?")) {

      document
        .querySelectorAll("input, textarea, select")
        .forEach((el) => {

          if (el.tagName === "SELECT") {
            el.selectedIndex = 0;
          } else {
            el.value = "";
          }

        });

    }
  };

  return (
    <div className="print-bar">

      <div className="print-bar-info">
        <strong>Client Information Sheet</strong> · Complete all sections · All amounts in USD
      </div>

      <div className="print-bar-actions">

        <button className="btn-reset" onClick={handleReset}>
          Clear Form
        </button>

        <button
          className="btn-print"
          onClick={() => window.print()}
        >
          Download / Print PDF
        </button>

      </div>

    </div>
  );
}

export default PrintBar;