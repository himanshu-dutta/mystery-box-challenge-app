import io
import torch
import base64
from PIL import Image
from torchvision import transforms
from ts.torch_handler.base_handler import BaseHandler

import config
from utils import non_max_suppression, adjust_ratio


class ObjectDetectionHandler(BaseHandler):
    """
    Accepts two types for requests:
        Base64 String
        Image Blob(ByteStream)
    """

    def __init__(self, *args, **kwargs):
        super().__init__()
        self.transform = transforms.Compose(
            [
                transforms.Resize((config.scaledSize, config.scaledSize)),
                transforms.ToTensor(),
            ]
        )

    def preprocess_one_image(self, req):
        """
        Process one single image.
        """

        # get image from the request
        image = req.get("data")

        if image is None:
            image = req.get("body")

        # create a stream from the encoded image
        if isinstance(image, str):
            image = base64.b64decode(image)

        byte_img = io.BytesIO(image)
        byte_img.seek(0)
        image = Image.open(byte_img)

        image_size = image.size
        image = self.transform(image)

        # add batch dim
        image = image.unsqueeze(0)

        return [image, image_size]

    def preprocess(self, requests):

        images = []
        image_sizes = []
        for req in requests:
            image, image_size = self.preprocess_one_image(req)
            images.append(image)
            image_sizes.append(image_size)

        images = torch.cat(images)
        if len(image_sizes) == 1:
            image_sizes = image_sizes[0]

        return {"images": images, "sizes": image_sizes}

    def inference(self, inp):

        x = inp["images"]
        x_size = inp["sizes"]

        outs = self.model.forward(x)

        preds = non_max_suppression(outs[0])

        preds_modified = []
        for pred in preds:
            pred_ = pred.cpu().numpy().tolist()

            for p in pred_:
                p[-1] = self.mapping[str(int(p[-1]))]
                p.extend(x_size)
                preds_modified.append(adjust_ratio(p, x_size, config.scaledSize))

        return preds_modified

    def postprocess(self, preds):
        return [{"predictions": preds}]
