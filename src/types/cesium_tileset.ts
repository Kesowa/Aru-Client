export default interface Tileset {
  asset: Asset
  geometricError: number
  properties: Properties
  root: Root
}

export interface Asset {
  version: string
}

export interface Properties {
  Height: Height
  Latitude: Latitude
  Longitude: Longitude
}

export interface Height {
  maximum: number
  minimum: number
}

export interface Latitude {
  maximum: number
  minimum: number
}

export interface Longitude {
  maximum: number
  minimum: number
}

export interface Root {
  boundingVolume: BoundingVolume
  children: Children[]
  content: Content
  geometricError: number
  refine: string
  transform: number[]
}

export interface BoundingVolume {
  box: number[]
}

export interface Children {
  boundingVolume: BoundingVolume
  children: Children[]
  content: Content
  geometricError: number
}

export interface Content {
  uri: string
  boundingVolume: BoundingVolume
}

