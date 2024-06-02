import RenderFileOnCanvas from "./Rendering";
import ScanService from "./services/3DScanService"

var DialogLine = 1;
const MaxWindows = 8;

//Added By Audrik
const scanService = new ScanService('http://localhost:18080');
//-----------------------
const viewCont = document.getElementById("objViewCont");
const clone = document.querySelector('.objViewWin').cloneNode(true);


function setup() {
    document.getElementById("Addbtn").addEventListener("click", nul => { AddView(null) });
    document.getElementById("combine").addEventListener("click", Combine);
    document.getElementById("saveBtn").addEventListener("click", SaveFile);
    document.getElementById("DarkLightBtn").addEventListener("click", DarkLightMode);
    document.getElementById("showOrHideDialog").addEventListener("click", function ()
    {
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

{
/**should enable a bright design, as an alternative to the for now dark-Design*/
function DarkLightMode()
{
function SaveFile()
{
/** */
function SaveFile()
{
async function Combine()
{
/** will call function that send data to the server and fetch a matrix,.. then combine to files in one*/
async function Combine()
{
    //var file = document.querySelector('.import').files[0];
    //AddView(file);
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    const combinedData = await fetch("http://localhost:18080/mergedData", requestOptions);

    var file = new File();
    AddView(file); // the resulting file/scan/3D-model-file goes in here and is displayed in a own window
{
/**
 * For later Use
 * @param {any} element
 */
function Highlight(element)
{
    element.classList.add("Highlight");
    element.classList.remove("Highlight");
}
/**
 * Adds EventListener to new Buttons, when new ViewWindow is created.
 * (EventListener don't get cloned)
 * it might look, like it made more sense to use IDs instead of classes, but this elements get cloned and therefor there would be multiple elements with the same Id => lots of errors & worst practise
 */
function AssignBtns()
{
    document.querySelector('.objViewWin:last-child .option-menu .import').addEventListener("change", event => { ImportFile(event.target) });
    document.querySelector('.objViewWin:last-child input.dragndrop').addEventListener("change", event => { ImportFile(event.target) });
}
function MiniView(evlement)
{    
/**
 * minimizing a ViewWindow with content, but deletes empty one.
 * @param {any} evlement
 */
function MiniView(evlement)
{    
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
function AddView(combineFile)
{
/**
 * Adds a new viewWindow
 * if combineFile is a file and not null, it will be displayed in the new viewWindow
 * @param {any} combineFile
 */
function AddView(combineFile)
{
    if (winCount < MaxWindows || combineFile) {
        if (winCount == 1) {
    if (winCount < MaxWindows || combineFile)
    {
            viewcont.querySelector('.miniBtn').classList.remove("not_accessible");
        }
        const viewclone = clone.cloneNode(true);
        if (combineFile) {
            visualFile(viewclone, combineFile);
        }
        viewcont.appendChild(viewclone);
        AssignBtns();

        if (winCount == MaxWindows) {
            document.getElementById('Addbtn').classList.add("not_accessible");
        }

    }
    else
    {
    else
    {
        AddToDialog("Sorry, you can't have more than " + MaxWindows + " Windows");
function ImportFile(eventtarget)
{
/**
 * Takes files from html input elements and puts them in visualFile(objView, file)
 * tests the format, as every file format can be droped but we don't support just any format 
 * @param {any} eventtarget
 */
function ImportFile(eventtarget)
{
    if (eventtarget.files.length > 0)
    {
        visualFile(graParent, file)
        var fileEnd = '.' + file.name.split(".").at(-1);
        if (fileEnd == '.ply' || fileEnd == '.stl' || fileEnd == '.xyz')
        {
            const graParent = eventtarget.parentNode.parentNode;
            visualFile(graParent, file)
        }
        else
        {
            AddToDialog('this doesn\'t seem to be the correct format. ... We\'re not supporting ' + fileEnd + '-formated files... we only work with .ply .xyz & .stl -formats for now');
        }
    }
    objView.title = file.name;
/**
 * 
 * @param {any} objView
 * @param {any} file
 */
    const canvas = objView.querySelector('canvas');
    objView.querySelector('.hint').classList.add("hidden");
    file.onload = RenderFileOnCanvas(file, canvas);
}
function AddToDialog(diamessage)
{
/**
 * takes a string or similar and displays it in the website
 * (if the dialog in the website is hidden, it will open when new messages arrive)
 * @param {any} diamessage
 */
function AddToDialog(diamessage)
{
    if (document.querySelectorAll('#Dialog.minimized').length > 0) {
        document.querySelector('#Dialog').classList.remove('minimized');
    }
}
var dialin = 0;
function RemoveView(evlement, doDelete)
{    
/**
 * If doDelete == true => deletes the refering ViewWindow
 * if doDelete == false => minimizes the refering ViewWindow with MiniView(evlement)
 * MiniView(evlement) will call RemoveView() with 'doDelete = true', if the refering ViewWindow has no content.(no title)
 * @param {any} evlement
 * @param {any} doDelete
 */
function RemoveView(evlement, doDelete)
{    
    var dias = ["...", "You can't do this...", "...", ".......", "You don't want to do this", "...", "...", "...", "We are protecting you from the vast nothing, the eternal blindness of ceasing matter, the uncomprehendable darkness of the never ending light...", "...", "...", "..", ".", ""];
    
    if (viewCont.childElementCount - miniviewCount > 1) {
        if (!doDelete) {
            MiniView(evlement);
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


