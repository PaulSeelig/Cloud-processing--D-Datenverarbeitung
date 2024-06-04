class ScanService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async Import3dScan(fileContent) {      
        const formData = new FormData();
        formData.append('File', fileContent);

        const response = await fetch(`${this.baseUrl}/Import3dScan`, {
            method: 'POST',
            body: formData
        });
        //console.log(response.body);
        //console.log(response.text())

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response;
    }

    async merge3DScans(files) {

        console.log(files)
        const response = await fetch(`${this.baseUrl}/merge3DScans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify({ files: files })
        });
        console.log(response)


        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    }

    async export3DScan(points) {
        const response = await fetch(`${this.baseUrl}/export3DScan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ points })
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
