import INode from "../types/INode";
import { dealShadow, helperForColor } from "../utils";
import { createContent } from "./createContent";
import { createImg } from "./createImg";

export const createFrame = (
  node: INode,
  parent?: INode,
  parentNode?: PageNode | FrameNode
): FrameNode | null => {
  if (node.tag === "SCRIPT") {
    return null;
  }
  const frame = figma.createFrame();
  parentNode?.appendChild(frame);
  const { x, y, width, height } = node.rect;
  frame.x = parent ? x - parent.rect.x : x;
  frame.y = parent ? y - parent.rect.y : y;
  frame.resizeWithoutConstraints(width, height);
  const color = helperForColor(node.backgroundColor);

  frame.fills = [
    {
      type: "SOLID",
      color: { r: color[0], g: color[1], b: color[2] },
      opacity: color[3],
    },
  ];
  if (node.boxShadow.length > 0) {
    const { shadowColor, offsetX, offsetY, radius, spread } = dealShadow(
      node.boxShadow
    );
    frame.effects = [
      {
        type: "DROP_SHADOW",
        color: {
          r: shadowColor[0],
          g: shadowColor[1],
          b: shadowColor[2],
          a: shadowColor[3],
        },
        offset: { x: offsetX, y: offsetY },
        radius,
        spread,
        blendMode: "NORMAL",
        visible: true,
      },
    ];

    if (frame.backgrounds[0].opacity === 0) {
      let pointer = frame;
      while (pointer.backgrounds[0].opacity === 0) {
        pointer = pointer.parent as FrameNode;
      }

      frame.fills = pointer.backgrounds;
    }
  }

  //   corner case
  if (node.text.length > 0) {
    const temp = createContent(node.text, node);
    frame.appendChild(temp);
  } else if (node.src.length > 0) {
    const content = createImg(frame);
    frame.appendChild(content);
  }

  for (const child of node.children) {
    const temp = createFrame(child, node, frame);
    temp && frame.appendChild(temp);
  }

  return frame;
};