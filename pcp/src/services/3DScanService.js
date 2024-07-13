class ScanService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }


    async Delete3DFile(fileIndex) {
        var ans = "";
        await fetch(`${this.baseUrl}/delete3DFile`, {
            method: 'Post',
            body: fileIndex
        }).then(response => {
            response.text();
            ans = response;
        });
        return ans;
    }

    async Import3dScan(file, fileEnd) {
        const formData = new FormData();
        formData.append('FileContent', file);
        formData.append('FileEnd', fileEnd);
        formData.append('Name', file.name);
        var resp = "";

        await fetch(`${this.baseUrl}/Import3dScan`, {
            method: 'POST',
            body: formData
        }).then(response => response.text())
            .then(data => {
                console.log(data);
                resp = data;
            }).catch(error => { return error });
        return resp;
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
        return answer;
    }

    async ICPmerge(matrix) { //[Matrix] = matrix ; [Filename1] [filname2]
        var answer = "";
        await fetch(`${this.baseUrl}/mergeImportedFiles`, {
            method: 'POST',
            body: matrix,
            redirect: "follow"
        }).then(response => response.text())
            .then(data => {
                answer = data;
            });
        return answer;
    }
}


export default ScanService;
