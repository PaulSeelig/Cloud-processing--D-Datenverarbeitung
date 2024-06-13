import RenderFileOnCanvas from "./Rendering";
import ScanService from "./services/3DScanService"

var DialogLine = 1;


const MaxWindows = 8;

//Added By Audrik
const scanService = new ScanService('http://localhost:18080');
//-----------------------

const clone = document.querySelector('#objViewCont .objViewWin').cloneNode(true);



function setup() {
    document.getElementById("Addbtn").addEventListener("click", nul => { AddView(null) });
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
    AddToDialog("Good morning folks... ");
    AssignBtns();
    AddView(null);
    AddToDialog("I don't care for the actual time... Have Fun");
}

/**should enable a bright design, as an alternative to the for now dark-Design*/
function DarkLightMode() {
    AddToDialog("Not implemented yet,...sry ://")
}
function SaveFile() {
    AddToDialog("Uuuuhm... Nothing there to save...")
}
async function Combine() {

    const dragelements = document.querySelectorAll('[type="file"]');
    const files = [];
    const PickPoints = [];
    for (const drgndrpelement of dragelements)
    {
        const view = drgndrpelement.parentNode.parentNode;
        const canvas = view.querySelector('canvas');
        if (drgndrpelement.files[0] && canvas.textContent != '')
        {
            files.push(drgndrpelement.files[0]);
            PickPoints.push(canvas.textContent);
            MiniView(drgndrpelement);
        }
    }
    AddToDialog(PickPoints)

    AddView(files);

    AddToDialog("Not fully Implemented Yet ... As u can c")
}
/**
 * Adds EventListener to new Buttons, when new ViewWindow is created.
 * (EventListener don't get cloned)
 * it might look, like it made more sense to use IDs instead of classes, but this elements get cloned and therefor there would be multiple elements with the same Id => lots of errors & worst practise
 */
function AssignBtns() {
    document.querySelector('.objViewWin:last-child .closeBtn').addEventListener("click", event => { RemoveView(event.target, true) });
    document.querySelector('.objViewWin:last-child .miniBtn').addEventListener("click", event => { RemoveView(event.target, false) });
    var importinput = document.querySelector('.objViewWin:last-child .import');
    importinput.addEventListener("change", event => { ImportFile(event.target) });
    document.querySelector('.objViewWin:last-child input.dragndrop').addEventListener("change", event => { ImportFile(event.target) });
}
/**
 * minimizing a ViewWindow with content, but deletes empty one.
 * @param {any} evlement
 */
function MiniView(evlement) {
    const view = evlement.parentNode.parentNode;
    if (view.title == "") { RemoveView(evlement, true); }
    else {
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
/**
 * Adds a new viewWindow
 * if combineFile is a file and not null, it will be displayed in the new viewWindow
 * @param {any} combineFile
 */
function AddView(combineFiles) {
    var viewcont = document.getElementById("objViewCont"); // gets the Element that contains all Viewports
    var winCount = viewcont.childElementCount;
    if (winCount < MaxWindows || combineFiles) {
        if (winCount == 1) {
            viewcont.querySelector('.closeBtn').classList.remove("not_accessible");
            viewcont.querySelector('.miniBtn').classList.remove("not_accessible");
        }
        const viewclone = clone.cloneNode(true);
        if (combineFiles) {
            visualFile(viewclone, combineFiles);
        }
        viewcont.appendChild(viewclone);
        AssignBtns();

        if (winCount == MaxWindows) {
            document.getElementById('Addbtn').classList.add("not_accessible");
        }
    }
    else {
        AddToDialog("Sorry, you can't have more than " + MaxWindows + " Windows open");
    }
}
/**
 * Takes files from html input elements and puts them in visualFile(objView, file)
 * tests the format, as every file format can be droped but we don't support just any format 
 * also tries to send files to server
 * @param {any} eventtarget
 */
async function ImportFile(eventtarget) {
    if (eventtarget.files.length > 0) {
            const file = [eventtarget.files[0]];
            var fileEnd = '.' + file[0].name.split(".").at(-1);
            if (fileEnd == '.ply' || fileEnd == '.stl' || fileEnd == '.xyz') {
                const graParent = eventtarget.parentNode.parentNode;
                visualFile(graParent, file)
                // Modified By Audrik --- 
                try {
                    const response = await scanService.Import3dScan(file[0]);
                    console.log('File successfully uploaded and validated:', response);
                    AddToDialog(`File successfully uploaded and validated`);
                    const text = await response.text(); // Hier wird der Text korrekt ausgelesen
                    //console.log(text);
                }
                catch (error) {
                    console.error('Error uploading file:', error);
                    AddToDialog(`Error uploading file: ${error.message}`);
                }
                //
            }
            else {
                AddToDialog('this doesn\'t seem to be the correct format. ... We\'re not supporting ' + fileEnd + '-formated files... we only work with .ply .xyz & .stl -formats for now');
            }
    }
}

function visualFile(objView, files) {
    //const files = filetwo? [file, filetwo] : [file]
    objView.title = files.length < 2 ? files[0].name : "CombineView: " + files[0].name + " + " + files[1].name;
    for (let i = 0; i < files.length - 1; i++) {
        const optionmenuContent = objView.querySelector('.Open_Further_Options_Container');
        const before = optionmenuContent.childNodes[5];
        optionmenuContent.insertBefore(optionmenuContent.querySelector('.rotateBtn').cloneNode(true), before);
        optionmenuContent.insertBefore(optionmenuContent.querySelector('.color').cloneNode(true), before);
        optionmenuContent.insertBefore(optionmenuContent.querySelector('.pointsize').cloneNode(true), before);
    }
    const canvas = objView.querySelector('canvas');
    objView.querySelector('.hint').classList.add("hidden");
    files.onload = RenderFileOnCanvas(files, canvas);
}
/**
 * takes a string or similar and displays it in the website
 * (if the dialog in the website is hidden, it will open when new messages arrive)
 * @param {any} diamessage
 */
function AddToDialog(diamessage) {
    document.querySelector('#Dialog p').innerHTML += "<br>" + DialogLine + ": " + diamessage;
    DialogLine++;
    if (document.querySelectorAll('#Dialog.minimized').length > 0) {
        document.querySelector('#Dialog').classList.remove('minimized');
    }
}
var dialin = 0;
/**
 * If doDelete == true => deletes the refering ViewWindow
 * if doDelete == false => minimizes the refering ViewWindow with MiniView(evlement)
 * MiniView(evlement) will call RemoveView() with 'doDelete = true', if the refering ViewWindow has no content.(no title)
 * @param {any} evlement
 * @param {any} doDelete
 */
function RemoveView(evlement, doDelete) {

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
    else {
        AddToDialog(dias[dialin]);
        dialin += dialin < (dias.length - 1) ? 1 : 0;
    }
}
window.addEventListener("load", setup);