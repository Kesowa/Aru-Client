import { CompositeLayer } from "@deck.gl/layers";

class WrappedTextLayer extends CompositeLayer<any, any> {
  static defaultProps = {};
  static layerName = {};
  renderLayers() {
    // a method of `Layer` classes
    // special logic here
    console.log();
  }
}
WrappedTextLayer.layerName = "WrappedTextLayer";

export { WrappedTextLayer };
