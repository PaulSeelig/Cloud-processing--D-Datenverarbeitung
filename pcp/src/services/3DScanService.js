class ScanService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }


    async Delete3DFile(file) {
        var data_ = ""
        const formData = new FormData();
        formData.append("FILE", file);
        await fetch(`${this.baseUrl}/delete3DFile`, {
            method: 'Post',
            body: formData
        }).then(response => response.text())
            .then(data => {
                data_ = data
                console.log(data);
            });


        return data_;
    }

    async Import3dScan(fileContent) {
        const formData = new FormData();
        formData.append('File', fileContent);

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
        var answer = ""
        await fetch(`${this.baseUrl}/pointsPicked`, {
            method: 'POST',
            body: points,
            redirect: "follow"
        }).then(response => response.text())
            .then(data => {
                answer = data;
            });
        //console.log(response)


        //if (!response.ok) {
        //    throw new Error(`HTTP error! Status: ${response.status}`);
        //}

        return answer;
    }

    async ICPmerge(matrix) {
        const formData = new FormData();
        formData.append('matrix', matrix);

        const response = await fetch(`${this.baseUrl}/mergeImportedFiles`, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
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
