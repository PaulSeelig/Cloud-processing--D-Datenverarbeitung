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

    async Import3dScan(file, fileEnd) {
        const formData = new FormData();
        formData.append('FileContent', file);
        formData.append('FileEnd', fileEnd);
        formData.append('Name', file.name);


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
        await fetch(`${this.baseUrl}/pointsPicked`, {
            method: 'POST',
            body: points,
            redirect: "follow"
        }).then(response => response.text())
            .then(data => {
                return data;
            });
    }

    async ICPmerge(matrix) { //[Matrix] = matrix ; [Filename1] [filname2]
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
