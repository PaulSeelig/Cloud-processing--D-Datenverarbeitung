class ScanService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }


    async Delete3DFile(fileIndex) {
        await fetch(`${this.baseUrl}/delete3DFile`, {
            method: 'Post',
            body: fileIndex
        }).then(response => {
            response.text();
            return response;
            });
    }

    async Import3dScan(fileContent, fileEnd) {
        const formData = new FormData();
        formData.append('File', fileContent);
        formData.append('Name', fileEnd);

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
        await fetch(`${this.baseUrl}/mergeImportedFiles`, {
            method: 'POST',
            body: matrix,
            redirect: "follow"
        }).then(response => response.text())
            .then(data => {
                return data;
            });
       
    }
}


export default ScanService;
