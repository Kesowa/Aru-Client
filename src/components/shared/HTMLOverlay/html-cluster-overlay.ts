import { point } from "@turf/helpers";
import Supercluster from "supercluster";
import HtmlOverlay from "./html-overlay";

type OptionalObject = Record<string, any> | null | undefined;

export default class HtmlClusterOverlay<ObjType> extends HtmlOverlay {
  _superCluster: Record<string, any>;
  _lastObjects: ObjType[] | null | undefined = null;

  getItems(): Record<string, any>[] {
    // supercluster().load() is expensive and we want to run it only
    // when necessary and not for every frame.

    // TODO: Warn if this is running many times / sec

    const newObjects = this.getAllObjects();
    if (newObjects !== this._lastObjects) {
      this._superCluster = new Supercluster(this.getClusterOptions());
      this._superCluster.load(
        newObjects.map((object) =>
          point(this.getObjectCoordinates(), { object })
        )
      );
      this._lastObjects = newObjects;
    }

    const clusters = this._superCluster.getClusters(
      [-180, -90, 180, 90],
      Math.round(this.getZoom())
    );

    return clusters.map(
      ({
        properties: {
          cluster,
        },
      }) =>
        cluster
          ? this.renderCluster()
          : this.renderObject()
    );
  }

  getClusterObjects(clusterId: number): ObjType[] {
    return this._superCluster
      .getLeaves(clusterId, Infinity)
      .map((object) => object.properties.object);
  }

  // Override to provide items that need clustering.
  // If the items have not changed please provide the same array to avoid
  // regeneration of the cluster which causes performance issues.
  getAllObjects(): ObjType[] {
    return [];
  }

  // override to provide coordinates for each object of getAllObjects()
  getObjectCoordinates(): [number, number] {
    return [0, 0];
  }

  // Get options object used when instantiating supercluster
  getClusterOptions(): OptionalObject {
    return {
      maxZoom: 20,
    };
  }

  // override to return an HtmlOverlayItem
  renderObject(): OptionalObject {
    return null;
  }

  // override to return an HtmlOverlayItem
  // use getClusterObjects() to get cluster contents
  renderCluster(): OptionalObject {
    return null;
  }
}
