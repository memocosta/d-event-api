let sharp = require('sharp');
var GenerateImage = async function (imgBuffer, width, height, type, Imagefor, name) {
    let bigImagePath = './assets/images/' + Imagefor + `/${type}/` + name;
    await sharp(imgBuffer).resize(width, height, { fit: 'inside' }).toFile(bigImagePath);
}
module.exports = {

    friendlyName: 'Upload image',
    description: '',
    inputs: {
        base64Image: {
            type: 'string',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        alt: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string',
            required: true
        },
        for: {
            type: 'string',
            required: true
        },
        width: {
            type: 'number',
            required: true,
        },
        height: {
            type: 'number',
            required: true,
        },
        options: {
            type: 'ref'
        }
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        if (inputs.base64Image) {
            var imageObject = {
                name: 'default.jpg',
                description: inputs.description,
                alt: inputs.alt,
                for: inputs.for,
            };
            const uri = inputs.base64Image.split(';base64,').pop();
            imageObject.name = inputs.name + require("randomstring").generate(3) + '.jpg';
            let ImagePath = './assets/images/' + inputs.for + '/' + imageObject.name;
            let imgBuffer = Buffer.from(uri, 'base64');

            // Generate original image
            // await sharp(imgBuffer).resize(inputs.width, inputs.height,{fit: 'inside'}).toFile(ImagePath);
            await sharp(imgBuffer).toFile(ImagePath);


            GenerateImage(imgBuffer, 254, 216, 'small', inputs.for, imageObject.name);
            GenerateImage(imgBuffer, 1081, 338, 'big', inputs.for, imageObject.name);
            GenerateImage(imgBuffer, 512, 258, 'medium', inputs.for, imageObject.name);

            let CreatedImageOBJ = await Image.create(imageObject);
            return exits.success(CreatedImageOBJ);
        } else {
            return exits.error(err);
        }
    }
};

