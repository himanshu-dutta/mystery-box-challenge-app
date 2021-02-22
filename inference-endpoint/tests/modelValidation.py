import torch
import torchvision.transforms as tfrm
from PIL import Image, ImageDraw

from utils import non_max_suppression, adjust_ratio_xyxy


model = torch.jit.load("../assets/yolov5m.torchscript.pt")

img = Image.open("../images/cl2.jpg").convert("RGB")
img_ = img.resize((640, 640))
inp = tfrm.ToTensor()(img_).unsqueeze(0)
print(inp.shape)

pred = model(inp)

pred = pred[0]
pred = non_max_suppression(pred)[0].cpu().numpy().tolist()
print(pred)

draw = ImageDraw.Draw(img, "RGBA")

for p in pred:
    p = adjust_ratio_xyxy(p, img.size, 640)
    x1, y1, x2, y2 = p[:4]
    draw.rectangle(((x1, y1), (x2, y2)), fill=(200, 100, 0, 127))
    draw.rectangle(((x1, y1), (x2, y2)), outline=(0, 0, 0, 127), width=3)

img.show()
