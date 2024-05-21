function optionmenu() {
  return (
      <div className="option-menu">
          <button type="button" className="hideBtn objViewBtn">hide</button>
          <button type="button" className="lock objViewBtn">lock</button>
          <button type="button" className="rotateBtn objViewBtn">rotate</button>
          <button type="button" className="closeBtn objViewBtn">close</button>
          <button type="button" className="objViewBtn">(hier kommen Icons hin)</button>
      </div>
  );
}

export default optionmenu;