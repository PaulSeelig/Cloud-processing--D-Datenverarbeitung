import RenderFileOnCanvas from "./Rendering";
import ScanService from "./services/3DScanService"

var DialogLine = 1;

const MaxWindows = 8;

//Added By Audrik
const scanService = new ScanService('http://localhost:18080');
//-----------------------
const clone = document.querySelector('#objViewCont .objViewWin').cloneNode(true);
function setup() {
    document.getElementById("Addbtn").addEventListener("click", function () { AddView() }); // This is a stupid fix, don't touch it, unless ur solution really works ... Without the function(){ } the function is not working as a event but is executed once on setup.. idk why;
    document.getElementById("combine").addEventListener("click", function () {
        this.disabled = true;
        Combine();
        setTimeout(() => { this.disabled = false; }, 3000);
            
        
    });

    document.getElementById("saveBtn").addEventListener("click", SaveFile);

    document.querySelector('#MainOptions').addEventListener("change", event => { HideShowOptions(event.target) });
    document.querySelector('[name="maincolors"]').addEventListener("input", event => { document.querySelector('#objViewCont').style.setProperty("background", event.target.value); });

    document.getElementById("showOrHideDialog").addEventListener("click", function () {
        if (document.querySelectorAll('#Dialog.minimized').length > 0) {
            document.querySelector('#Dialog').classList.remove('minimized');
        }
        else {
            document.querySelector('#Dialog').classList.add('minimized');
        }
    });
    clone.classList.add('minimized');
    AddToDialog("Good morning folks... ");
    AssignBtns();
    AddView();
    AddToDialog("Using this site:");
    AddToDialog("1st step: Add atleast 2 3D-files (only 1 per view) to the site");
    AddToDialog("2nd step: set each 3 Points on the Models (with right- or doubleclick)");
    AddToDialog("[The Points with the same color will align to each other and transform the models accordingly]");
    AddToDialog("3rd step: press combine to see the files in one view aligned");
}

/**should enable a bright design, as an alternative to the for now dark-Design*/
function SaveFile() {
    AddToDialog("Uuuuhm... Nothing there to save...")
}
function CheckCombineConditions()
{
    if (document.querySelector('#objViewCont').childElementCount >= MaxWindows)
    {
        return "Sorry u can't have more than " + MaxWindows + " Views. Please remove a View before creating the next one, by combining two";
    }
    else {
        const imports = document.querySelectorAll('[type="file"]');
        var files = 0;
        var PPoints = 0;
        for (const imp of imports)
        {
            var canvas = imp.parentNode.parentNode.querySelector('canvas');
            imp.files[0] ? files++ : "";
            canvas.textContent != ''? PPoints++ : "";
        }
        return files < 2 ? "You need as least two files" : PPoints < 2 ? "you need atleast two models with each three pickedpoints on them, the first two are used for combine" : null;
    }
}
function Combine() {
    const errormsg = CheckCombineConditions();
    if (errormsg) { AddToDialog(errormsg) } 
    else {
        const files = [];
        var PickPoints = [];
        var canv = null ;
        var canv2 = null;
        for (const imp of document.querySelectorAll('[type="file"]')) {
            const canvas = imp.parentNode.parentNode.querySelector('canvas');
            if (imp.files[0] && canvas.textContent != '' && files.length < 3) {
                var pp = JSON.parse(canvas.textContent);
                files.push(imp.files[0]);
                PickPoints.push(pp[0], pp[1], pp[2]);
                MiniView(imp);
                !canv ? canv = canvas : canv2 = canvas;
            }
        }
        const title = "CombineView: " + files[0].name + " + " + files[1].name;
        var view = null;
        for (const objView of document.querySelectorAll('.objViewWin')) { title == objView.title ? view = objView : '' }
        const js = JSON.stringify(PickPoints);
        scanService.PickPointsMerge(js).then(resp =>
        {
            AddToDialog(resp);
            if (view) {
                view.querySelector('canvas').textContent = resp;
            }
            else {
                var params1 = [canv.parentNode.querySelector('[name="pointsize"]'), canv.parentNode.querySelector('[name="colors"]')];
                var params2 = [canv2.parentNode.querySelector('[name="pointsize"]'), canv2.parentNode.querySelector('[name="colors"]')];
                AddView(files, JSON.parse(resp), params1, params2)
                    .then(view => {
                    view.querySelector('.ICPBtn').classList.remove('hidden');
                    view.querySelector('.ICPBtn').addEventListener('click', function () {
                        scanService.ICPmerge(view.querySelector('canvas').textContent)
                            .then(
                            ICP_processed_matrix =>
                                view.querySelector('canvas').textContent = ICP_processed_matrix);
                    });
                });

                const observer = new MutationObserver(function () { Combine() });
                const observer2 = new MutationObserver(function () { Combine() });
                // Call 'observe' on the MutationObserver instance, specifying the element to observe
                observer.observe(canv, { childList: true });

                // Call 'observe' on the MutationObserver instance, specifying the element to observe
                observer2.observe(canv2, { childList: true });
            }
        });
    }

}
//function ICPMerge()
//{
//    
//}
/**
 * Adds EventListener to new Buttons, when new ViewWindow is created.
 * (EventListener don't get cloned)
 * it might look, like it made more sense to use IDs instead of classes, but this elements get cloned and therefor there would be multiple elements with the same Id => lots of errors & worst practise
 */
function AssignBtns() {
    document.querySelector('.objViewWin:last-child .closeBtn').addEventListener("click", event => { RemoveView(event.target, true) });
    document.querySelector('.objViewWin:last-child .miniBtn').addEventListener("click", event => { RemoveView(event.target, false) });
    //var importinput = document.querySelector('.objViewWin:last-child .import');
    //importinput.addEventListener("change", event => { ImportFile(event.target) });
    document.querySelector('.objViewWin:last-child input.dragndrop').addEventListener("change", event => { ImportFile(event.target) });
    //document.querySelector('.objViewWin:last-child .clearBtn').addEventListener("click", event => { RemoveFile(event.target) });

    document.querySelector('.objViewWin:last-child .Open_Further_Options').addEventListener("change", event => { HideShowOptions(event.target) });
     //document.querySelector('canvas').textContent.addEventListener("change", event => {
    //    var check = CheckCombineConditions();
    //    const combtn = document.querySelector('#combine');
    //    check ? combtn.classList.add('not_accessible') : combtn.remove('not_accessible');
    //})
}
/**
 * minimizing a ViewWindow with content, but deletes empty one.
 * @param {any} evlement
 */
function MiniView(evlement) {
    const view = evlement.parentNode.parentNode;
    
    if (view.title == "") { RemoveView(evlement, true); }
    else if (!view.classList.contains('minimized'))
    {
        view.classList.add('minimized');
        //view.querySelector('.rotateBtn').checked = false;
        const btn = document.createElement("button");
        btn.innerHTML = view.title;
        btn.addEventListener("click", function () {
            view.classList.remove('minimized');
            document.getElementById('miniViewContainer').removeChild(btn);
        })
        document.getElementById('miniViewContainer').appendChild(btn);
    }

    RemoveFile(evlement)
}
function Delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
/**
 * Adds a new viewWindow
 * if combineFile is a file and not null, it will be displayed in the new viewWindow
 * @param {any} combineFile
 */
async function AddView(combineFiles, tMatrix, params1, params2) {
    var viewcont = document.getElementById("objViewCont"); // gets the Element that contains all Viewports
    var winCount = viewcont.childElementCount;
    if (winCount < MaxWindows || combineFiles) {
        if (winCount == 1) {
            viewcont.querySelector('.closeBtn').classList.remove("not_accessible");
            viewcont.querySelector('.miniBtn').classList.remove("not_accessible");
        }
        const viewclone = clone.cloneNode(true);
        if (combineFiles) {
            visualFile(viewclone, combineFiles, tMatrix, params1, params2);
        }
        viewcont.appendChild(viewclone);
        AssignBtns();
        if (winCount == MaxWindows) {
            document.getElementById('Addbtn').classList.add("not_accessible");
        }
        await Delay(100);
        await viewclone.classList.remove('minimized');
        return viewclone;
    }
    else {
        AddToDialog("Sorry, you can't have more than " + MaxWindows + " Windows open");
    }
    
}

async function RemoveFile(evlement) {
    try {
        const view = evlement.parentNode.parentNode;

        var res = await scanService.Delete3DFile(evlement)
        //var viewCont = document.getElementById("objViewCont");
        //await viewCont.removeChild(view);
        //Delay(1000)
        //await AddView(null);
        AddToDialog(res)
    }
    catch (error) {
        console.error('Error deleting file:', error);
        AddToDialog(`Error deleting file: ${error.message}`);
    }


}
/**
 * Takes files from html input elements and puts them in visualFile(objView, file)
 * tests the format, as every file format can be droped but we don't support just any format 
 * also tries to send files to server
 * @param {any} eventtarget
 */
async function ImportFile(eventtarget) {
    if (eventtarget.files.length > 0)
    {
        const file = [eventtarget.files[0]];
        var fileEnd = '.' + file[0].name.split(".").at(-1);
        if ( ! (fileEnd == '.ply' || fileEnd == '.stl' || fileEnd == '.xyz') )
        {
            AddToDialog('this doesn\'t seem to be the correct format. ... We\'re not supporting ' + fileEnd + '-formated files... we only work with .ply .xyz & .stl -formats for now');
        }
        else
        {
            const view = eventtarget.parentNode.parentNode;
            visualFile(view, file)

            // Modified By Audrik --- 
            try {
                await scanService.Import3dScan(file[0], fileEnd);
                console.log('File successfully uploaded and validated:');
                //response.onload = AddToDialog(response.text());
                AddToDialog(`File successfully uploaded and validated`);
                //const text = await response.text(); // Hier wird der Text korrekt ausgelesen
                //console.log(text);
            }
            catch (error) {
                console.error('Error uploading file:', error);
                AddToDialog(`Error uploading file: ${error.message}`);
            }
        }
                
    }
}

function visualFile(objView, files, tMatrix, params1, params2) {
    objView.title = files.length == 1 ? files[0].name : "CombineView: " + files[0].name + " + " + files[1].name;
    const h2 = objView.querySelector('h2');
    h2.innerHTML = files[0].name;
    if(files.length == 2){
        const optionmenuContent = objView.querySelector('.Open_Further_Options_Container');
        const h2_2 = h2.cloneNode(true);
        h2_2.innerHTML = files[1].name;
        optionmenuContent.appendChild(h2_2);
        optionmenuContent.appendChild(optionmenuContent.querySelector('[name="model-color"]').cloneNode(true));
        optionmenuContent.appendChild(optionmenuContent.querySelector('[name="pt-size"]').cloneNode(true));
    }
    const canvas = objView.querySelector('canvas');
    objView.querySelector('.hint').classList.add("hidden");
    files.onload = RenderFileOnCanvas(files, canvas, tMatrix, params1, params2);
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
function HideShowOptions(optionsBtnCheck) {
    const optionsCont = optionsBtnCheck.parentNode.parentNode.querySelector('.Open_Further_Options_Container');
    if (optionsBtnCheck.checked) {
        optionsBtnCheck.classList.add('.opt-135Deg');
        optionsCont.classList.remove('minimized');
    }
    else {
        optionsCont.classList.add('minimized');
        optionsBtnCheck.classList.remove('.opt-135Deg');
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
async function RemoveView(evlement, doDelete) {
    const view = evlement.parentNode.parentNode;    
    var dias = ["...", "You can't do this...", "...", ".......", "You don't want to do this", "...", "...", "...", "We are protecting you from the vast nothing, the eternal blindness of ceasing matter, the uncomprehendable darkness of the never ending light...", "...", "...", "..", ".", ""];
    var viewCont = document.getElementById("objViewCont");
    const miniviewCont = document.getElementById('miniViewContainer');
    const mvcount = miniviewCont.childElementCount;
    if (viewCont.childElementCount - mvcount > 1 || mvcount > 0) {
        if (viewCont.childElementCount - mvcount == 1) { miniviewCont.childNodes[0].click() }
        if (!doDelete) {
            MiniView(evlement)
        }
        else {
            view.classList.add('minimized');
            await Delay(1000);
            viewCont.removeChild(view);
        }
        if (viewCont.childElementCount == (MaxWindows - 1)) {
            document.getElementById('Addbtn').classList.remove("not_accessible");
        }
        if (viewCont.childElementCount - mvcount == 1) {
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