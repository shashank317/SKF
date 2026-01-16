import fs from 'fs';

const filePath = 'c:\\Users\\shashank\\Desktop\\SKF3\\frontend\\src\\assets\\model.glb';

try {
    const buffer = fs.readFileSync(filePath);

    // GLB Header: 12 bytes
    const magic = buffer.toString('utf8', 0, 4);
    const version = buffer.readUInt32LE(4);
    const length = buffer.readUInt32LE(8);

    console.log('Magic:', magic);
    console.log('Version:', version);
    console.log('Total Length:', length);

    // Chunk 0: JSON
    const chunk0Length = buffer.readUInt32LE(12);
    const chunk0Type = buffer.toString('utf8', 16, 20);

    console.log('Chunk 0 Length:', chunk0Length);
    console.log('Chunk 0 Type:', chunk0Type);

    if (chunk0Type === 'JSON') {
        const jsonBuf = buffer.slice(20, 20 + chunk0Length);
        const jsonStr = jsonBuf.toString('utf8');
        const json = JSON.parse(jsonStr);

        console.log('Nodes:', json.nodes ? json.nodes.length : 0);
        console.log('Meshes:', json.meshes ? json.meshes.length : 0);

        if (json.nodes) {
            console.log('--- Node Hierarchy ---');
            json.nodes.forEach((node, index) => {
                console.log(`Node ${index}: ${node.name || '(unnamed)'} ${node.children ? `(Children: ${node.children.length})` : ''} ${node.mesh !== undefined ? `(Mesh: ${node.mesh})` : ''}`);
            });
        }
    }
} catch (error) {
    console.error("Error analyzing GLB:", error);
}
