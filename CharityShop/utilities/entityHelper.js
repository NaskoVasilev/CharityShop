const fs = require('fs');

let addBinaryFileToEntity = (req, entity) =>{
    let imagePath = req.file.path;
    entity.image = {};
    entity.image.data = fs.readFileSync(imagePath);
    entity.image.contentType = req.file.mimetype;
}

let addImageToEntity = (entity) =>{
    entity.image.data = new Buffer(entity.image.data).toString('base64');
}

let addImagesToEntities = (entities) =>{
    for (let entity of entities) {
        addImageToEntity(entity);
    }
}

module.exports = {
    addBinaryFileToEntity,
    addImageToEntity,
    addImagesToEntities
}