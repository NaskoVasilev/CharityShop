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

function addPropertyIsSelectedToCategory(entities, product, property){
    for (const entity of entities) {
        if(entity.id.toString() === product[property].toString()){
            entity.isSelected = true;
        }
        else{
            entity.isSelected = false;
        }
    }
}

function validateProduct(product){
    let message = null;
    if(!product.name){
        message = 'Името на продукта е задължително!'
    }
    else if(product.price <= 0){
        message = 'Цената не може да бъде по-малка от нула!';
    }

    return message;
}

module.exports = {
    addBinaryFileToEntity,
    addImageToEntity,
    addImagesToEntities,
    addPropertyIsSelectedToCategory,
    validateProduct
}