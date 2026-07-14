declare module "smartcrop" {
  type Crop = { x: number; y: number; width: number; height: number };
  const smartcrop: {
    crop(image: HTMLImageElement, options: { width: number; height: number }): Promise<{ topCrop: Crop }>;
  };
  export default smartcrop;
}
