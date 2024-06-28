class ScanService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }


    async Delete3DFiles() {

        const response = await fetch(`${this.baseUrl}/delete3DFiles`, {
            method: 'DELETE', // HTTP method should be in uppercase
            headers: {
                'Content-Type': 'application/json', // Include headers if needed
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response;
    }


    async Import3dScan(file, fileEnd) {
        const formData = new FormData();
        formData.append('File', file);
        formData.append('fileName', file.name)
        formData.append('fileType', fileEnd)

        const response = await fetch(`${this.baseUrl}/Import3dScan`, {
            method: 'POST',
            body: formData
        }).then(response => response.text())
            .then(data => {
                console.log(data);
            });
        return response;
    }

    async PickPointsMerge(points) {
        var answer = "";
        const myheader = new Headers();
        myheader.append("Content-Type", "application/json");
        await fetch(`${this.baseUrl}/pointsPicked`, {
            method: 'POST',
            body: points,
            redirect: "follow"
        }).then(response => response.text())
            .then(data => {
                answer = data;
            });


        return answer;
    }

    async ICPmerge() {
        const response = await fetch(`${this.baseUrl}/mergeImportedFiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            /*body: */
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const blob = await response.blob();  // Get the response as a blob
        const url = window.URL.createObjectURL(blob);  // Create a URL for the blob
        const a = document.createElement('a');  // Create an <a> element
        a.href = url;
        a.download = "exported_scan.ply";  // Set the default filename for the download
        document.body.appendChild(a);
        a.click();  // Simulate a click on the <a> element
        a.remove();  // Remove the <a> element from the document
        window.URL.revokeObjectURL(url);  // Clean up the URL object
    }
}


export default ScanService;
