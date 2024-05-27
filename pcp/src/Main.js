import ReactSetPointMenu from "./src/ReactComponent";
import ReactDOM from 'react-dom/client';
import RenderFileOnCanvas from "./src/Rendering";

var DialogLine = 1;
const MaxWindows = 8;
function setup() {
    document.getElementById("Addbtn").addEventListener("click", AddView);
    document.getElementById("combine").addEventListener("click", Combine);

    document.getElementById("saveBtn").addEventListener("click", SaveFile);
    document.getElementById("DarkLightBtn").addEventListener("click", DarkLightMode);

    document.getElementById("showOrHideDialog").addEventListener("click", function () {
        if (document.querySelectorAll('#Dialog.minimized').length > 0) {
            document.querySelector('#Dialog').classList.remove('minimized');
        }
        else {
           document.querySelector('#Dialog').classList.add('minimized');
        }
    });
    //document.querySelector('#objViewCont .objViewWin canvas').addEventListener("click", event => { RenderOnCanvas(event) });
    AddToDialog("Good morning folks... ");
    AddToDialog("I don't care for the actual time... Have Fun");
    AssignBtns();
    AddView();

    // Create a new instance of MutationObserver, passing it a callback function // same as adventlistener, but can handle the change of innerHTML
    const observer = new MutationObserver(function () {
        if (document.querySelectorAll('#Dialog.minimized').length > 0) {
            document.querySelector('#Dialog').classList.remove('minimized');
        }
    });
    // Call 'observe' on the MutationObserver instance, specifying the element to observe
    observer.observe(document.querySelector('#Dialog p'), { childList: true });
}
function DarkLightMode()
{
    AddToDialog("Not implemented yet,...sry ://")
}
function SaveFile()
{
    AddToDialog("Uuuuhm... Nothing there to save...")
}
function Combine()
{
    AddToDialog("Sorry, this is not coded yet...")
}
function Highlight(element)
{
    element.classList.add("Highlight");
    element.classList.remove("Highlight");
}
function AssignBtns()
{
    document.querySelector('.objViewWin:last-child .option-menu .closeBtn').addEventListener("click", event => { RemoveView(event) });
    document.querySelector('.objViewWin:last-child .option-menu .import').addEventListener("change", event => { ImportFile(event.target) });
}
function AddView() {
    var viewcont = document.getElementById("objViewCont"); // gets the Element that contains all Viewports
    if (viewcont.childElementCount < MaxWindows) {

        viewcont.appendChild(document.querySelector('#objViewCont .objViewWin').cloneNode(true));
        AssignBtns();
        if (document.querySelector('.objViewWin:last-child .hint.hidden')) {
            document.getElementsByClassName("hint hidden").item(document.getElementsByClassName("hint hidden").length - 1).classList.remove("hidden");
        }
        if (viewcont.childElementCount == MaxWindows) { document.getElementById('Addbtn').classList.add("not_accessible"); }
    }
    else
    {
        AddToDialog("Sorry, you can't have more than " + MaxWindows + " Windows open");
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
function AddToDialog(diamessage)
{
    document.querySelector('#Dialog p').innerHTML += "<br>" + DialogLine + ": " + diamessage;
    DialogLine++;
}
function RemoveView(event)
{    
    var viewCont = document.getElementById("objViewCont");
    if (viewCont.childElementCount > 1)
    {
        viewCont.removeChild(event.target.parentNode.parentNode);
        if (viewCont.childElementCount == (MaxWindows - 1))
        {
            document.getElementById('Addbtn').classList.remove("not_accessible");
        }
    }
}

function OpenSetPointsMenu() {
    var roo = document.getElementById("root");
    roo.childElementCount > 0 ? roo.childNodes.forEach(roo.removeChild(roo.firstChild)) : ReactDOM.createRoot(roo).render(ReactSetPointMenu());
}


function handleFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    scanService.load3DScan(file).then(model => {
        const container = document.querySelector('#objViewCont .objViewWin');
        scanService.visualize3DScan(container);
    }).catch(error => {
        console.error('Error loading 3D scan:', error);
    });
}



window.addEventListener("load", setup);
setupMockApi();