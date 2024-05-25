// Mock API Endpoints
function setupMockApi() {
    window.fetch = async (url, options) => {
        if (url === '/api/load3dscan' && options.method === 'POST') {
            // Simulate loading 3D scan file
            const file = options.body.get('file');
            const text = await file.text();
            return new Response(text);
        }

        if (url === '/api/export3dscan' && options.method === 'POST') {
            // Simulate exporting 3D scan files
            const file1 = options.body.get('file1');
            const file2 = options.body.get('file2');
            const text1 = await file1.text();
            const text2 = await file2.text();
            const combinedText = `${text1.trim()}\n${text2.trim()}`;
            return new Response(combinedText);
        }

        return new Response(null, { status: 404 });
    };
}

export default setupMockApi;