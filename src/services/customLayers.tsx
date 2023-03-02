import { CompositeLayer } from "@deck.gl/layers";

class WrappedTextLayer extends CompositeLayer<any, any> {
  static defaultProps = {};
  static layerName = {};
  renderLayers() {
    // a method of `Layer` classes
    // special logic here
    console.log();
    //return [new TextLayer(this.props)];
  }
}
WrappedTextLayer.layerName = "WrappedTextLayer";
// WrappedTextLayer.defaultProps = {
//     getText: (): string => 'x',
//     getSize: (): number => 32,
//     getColor: [255, 255, 255]
// };

export { WrappedTextLayer };
