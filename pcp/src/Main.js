import { createContext } from "react";
import RenderFileOnCanvas from "./Rendering";

var DialogLine = 1;
const MaxWindows = 8;
const clone = document.querySelector('#objViewCont .objViewWin').cloneNode(true);
function setup() {
    document.getElementById("Addbtn").addEventListener("click", AddView);
    document.getElementById("combine").addEventListener("click", Combine);

    //document.getElementById("combine").addEventListener("click", GetCombinedFile);

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
    AddToDialog("Good morning folks... ");
    AddToDialog("I don't care for the actual time... Have Fun");
    AssignBtns();
    AddView();

    // Create a new instance of MutationObserver, passing it a callback function // same as adventlistener, but can handle the change of innerHTML
    const observer = new MutationObserver(function ()
    {
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
    document.querySelector('.objViewWin:last-child .option-menu .closeBtn').addEventListener("click", event => { RemoveView(event.target, true) });
    document.querySelector('.objViewWin:last-child .option-menu .miniBtn').addEventListener("click", event => { RemoveView(event.target, false) });
    var importinput = document.querySelector('.objViewWin:last-child .option-menu .import');
    importinput.addEventListener("change", event => { ImportFile(event.target) });
    document.querySelector('.objViewWin:last-child input.dragndrop').addEventListener("change", event => { ImportFile(event.target) });
}
function MiniView(evlement)
{    
    const view = evlement.parentNode.parentNode;
    if (view.title == "") { RemoveView(evlement, true); }
    else
    {
        view.classList.add('minimized');
        view.querySelector('.rotateBtn').checked = false;
        const btn = document.createElement("button");
        btn.innerHTML = view.title;
        btn.addEventListener("click", function () {
            view.classList.remove('minimized');
            document.getElementById('miniViewContainer').removeChild(btn);
        })
        document.getElementById('miniViewContainer').appendChild(btn);
    }
}
function AddView()
{
    var viewcont = document.getElementById("objViewCont"); // gets the Element that contains all Viewports
    var winCount = viewcont.childElementCount;
    if (winCount < MaxWindows)
    {
        if (winCount == 1) {
            viewcont.querySelector('.closeBtn').classList.remove("not_accessible");
            viewcont.querySelector('.miniBtn').classList.remove("not_accessible");
        }
        viewcont.appendChild(clone.cloneNode(true));
        AssignBtns();
        if (winCount == MaxWindows)
        {
            document.getElementById('Addbtn').classList.add("not_accessible");
        }
        
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
        const graParent = eventtarget.parentNode.parentNode;
        graParent.title = file.name;
        const canvas = graParent.querySelector('canvas')
        graParent.querySelector('.hint').classList.add("hidden"); 
        file.onload = RenderFileOnCanvas(file, canvas);
    }
}
function AddToDialog(diamessage)
{
    document.querySelector('#Dialog p').innerHTML += "<br>" + DialogLine + ": " + diamessage;
    DialogLine++;
}
var dialin = 0;
function RemoveView(evlement, doDelete)
{    
    
    var dias = ["...", "You can't do this...", "...", ".......", "You don't want to do this", "...", "...", "...", "We are protecting you from the vast nothing, the eternal blindness of ceasing matter, the uncomprehendable darkness of the never ending light...", "...", "...", "..", ".", ""];
    var viewCont = document.getElementById("objViewCont");
    const miniviewCount = document.getElementById('miniViewContainer').childElementCount;
    if (viewCont.childElementCount - miniviewCount > 1) {
        if (!doDelete) {
            MiniView(evlement)
        }
        else {
            viewCont.removeChild(evlement.parentNode.parentNode);
        }
        if (viewCont.childElementCount == (MaxWindows - 1)) {
            document.getElementById('Addbtn').classList.remove("not_accessible");
        }
        if (viewCont.childElementCount - miniviewCount == 1) {
            viewCont.querySelector('.closeBtn').classList.add("not_accessible");
            viewCont.querySelector('.miniBtn').classList.add("not_accessible");
        }
    }
    else
    {
        AddToDialog(dias[dialin]);
        dialin += dialin < (dias.length - 1)?  1: 0;
    }
}


//function handleFile(event) {
//    const file = event.target.files[0];
//    if (!file) {
//        return;
//    }

//    scanService.load3DScan(file).then(model => {
//        const container = document.querySelector('#objViewCont .objViewWin');
//        scanService.visualize3DScan(container);
//    }).catch(error => {
//        console.error('Error loading 3D scan:', error);
//    });
//}

window.addEventListener("load", setup);
//setupMockApi();