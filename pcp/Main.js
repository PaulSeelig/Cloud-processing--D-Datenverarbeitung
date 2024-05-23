import ReactSetPointMenu from "./src/ReactComponent";
import ReactDOM from 'react-dom/client';
import RenderFileOnCanvas from "./src/Rendering";
function setup() {
    document.getElementById("Addbtn").addEventListener("click", AddView);
    //document.getElementById("Removebtn").addEventListener("click", RemoveView);
    document.getElementById("SetPointsbtn").addEventListener("click", OpenSetPointsMenu);
    //document.querySelector('#objViewCont .objViewWin canvas').addEventListener("click", event => { RenderOnCanvas(event) });
    AssignBtns();
    AddView();
}
function AssignBtns()
{
    document.querySelector('.objViewWin:last-child .option-menu .closeBtn').addEventListener("click", event => { RemoveView(event) });
    document.querySelector('.objViewWin:last-child .option-menu .import').addEventListener("change", event => { ImportFile(event.target) });
    //document.querySelector('.objViewWin:last-child .option-menu .pointsize').addEventListener("change", event => { ImportFile(event.target.parentNode.querySelector('.import')) });
    
}
function AddView() {
    var viewcont = document.getElementById("objViewCont"); // gets the Element that contains all Viewports
    if (viewcont.childElementCount < 8) {

        viewcont.appendChild(document.querySelector('#objViewCont .objViewWin').cloneNode(true));
        //viewcont.lastChild.addEventListener("click", event => { RenderFileOnCanvas(event) });
        //viewcont.lastChild.querySelector('[name="choosefile"]').files[0] = null; 
        AssignBtns();

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
function ImportFile(eventtarget)
{
    if (eventtarget.files.length > 0) {
        const file = eventtarget.files[0];
        const canvas = eventtarget.parentNode.nextElementSibling;
        canvas.nextElementSibling.classList.add("hidden"); 
        file.onload = RenderFileOnCanvas(file, canvas);
    }
}
function RemoveView(event) {
    
    var viewCont = document.getElementById("objViewCont");
    if (viewCont.childElementCount > 1) {
        viewCont.removeChild(event.target.parentNode.parentNode);
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