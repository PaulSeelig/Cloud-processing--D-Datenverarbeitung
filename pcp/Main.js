import ReactSetPointMenu from "./src/ReactComponent";
import ReactDOM from 'react-dom/client';
import RenderOnCanvas from "./src/Rendering";
function setup() {
    document.getElementById("Addbtn").addEventListener("click", AddView);
    document.getElementById("Removebtn").addEventListener("click", RemoveView);
    document.getElementById("SetPointsbtn").addEventListener("click", OpenSetPointsMenu);
    document.querySelector('#objViewCont .objViewWin canvas').addEventListener("click", event => { RenderOnCanvas(event) });
    AddView();
}
function AddView() {
    var viewcont = document.getElementById("objViewCont"); // gets the Element that contains all Viewports
    if (viewcont.childElementCount < 8) {

        viewcont.appendChild(document.querySelector('#objViewCont .objViewWin').cloneNode(true));
        viewcont.lastChild.addEventListener("click", event => { RenderOnCanvas(event) });
        document.getElementsByClassName("hint hidden").item(document.getElementsByClassName("hint hidden").length - 1).classList.remove("hidden");

        var combBtn = document.getElementById("combine"); // from here the appearance/location of the combine Btn is decided
        if (viewcont.childElementCount == 2) {
            combBtn.classList.remove("hidden");
        }
        else if (viewcont.childElementCount == 3) {
            combBtn.style.bottom = "3%";
            combBtn.style.right = "calc(3% + 18em)";
            combBtn.style.top = "unset";
        }
    }
}
function RemoveView() {
    var viewCont = document.getElementById("objViewCont");
    if (viewCont.childElementCount > 1) {
        viewCont.removeChild(viewCont.lastChild);
        if (viewCont.childElementCount == 1) {
            document.getElementById("combine").classList.add("hidden");
        }
    }
}

function OpenSetPointsMenu() {
    var roo = document.getElementById("root");
    roo.childElementCount > 0 ? roo.childNodes.forEach(roo.removeChild(roo.firstChild)) : ReactDOM.createRoot(roo).render(ReactSetPointMenu());
}


window.addEventListener("load", setup);