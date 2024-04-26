function ReactSetPointMenu() {
  return (
      <div className="menu">
          <lable htmlFor="point_1" >points 1</lable>
          <input type="radio" name="point" value="0" id="point_1"></input>

          <lable htmlFor="point_2">points 2</lable>
          <input type="radio" name="point" value="1" id="point_2"></input>

          <lable htmlFor="point_3">points 3</lable>
          <input type="radio" name="point" value="2" id="point_3"></input>
      </div>
  );
}
export default ReactSetPointMenu;