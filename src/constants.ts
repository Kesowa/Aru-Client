const checkEnum = (e) => (val) => Object.values(e).includes(val);
const castEnum = <T>(val: string) => val as T;
const checkUrl = (val: string) => {
  if (val.endsWith("/")) {
    new URL(val);
    return false;
  }
  return true;
};
const castUrl = (val: string) => new URL(val);

class Var {
  key: string;
  val: string;
  constructor(key: string) {
    this.key = key;
    this.val = key;
  }
  isUrl() {
    return this.check(checkUrl);
  }
  isEnum(e) {
    return this.check(checkEnum(e));
  }
  toUrl() {
    return this.cast(castUrl);
  }
  toEnum<T>() {
    return this.cast<T>(castEnum);
  }
  toString() {
    return this.cast(String);
  }
  toNumeric() {
    return this.cast(Number);
  }
  check(fn: (val: string) => boolean) {
    try {
      if (fn(this.val)) return this;
      else throw new CheckError(this.key, this.val);
    } catch (err) {
      console.group("CheckError");
      console.error(err);
      console.groupEnd();
      throw new CheckError(this.key, this.val);
    }
  }
  cast<T>(op: (val: string) => T) {
    try {
      return op(this.val);
    } catch (error) {
      console.group("CheckError");
      console.error(error);
      console.groupEnd();
      throw new CastError(this.key, this.val);
    }
  }
}

class WindowVar extends Var {
  constructor(key: string) {
    super(key);
    const val = window["config"][key];
    if (val === undefined || val.length === 0) throw new EnvError(key, val);
    this.val = val;
  }
}

class EnvVar extends Var {
  constructor(key: string) {
    super(key);
    const val = import.meta.env[key];
    if (val === undefined || val.length === 0) throw new EnvError(key, val);
    this.val = val;
  }
}

class EnvError extends Error {
  constructor(key: string, val: undefined | string) {
    super();
    this.message = `No value found for key ${key}`;
  }
}
class CheckError extends Error {
  constructor(key: string, val: undefined | string) {
    super();
    this.message = `Invalid value ${val} for key ${key}`;
  }
}
class CastError extends Error {
  constructor(key: string, val: undefined | string) {
    super();
    this.message = `Unable to convert value ${val} for key ${key}`;
  }
}

export const MAPBOX_API_KEY = new EnvVar("VITE_MAPBOX_API_KEY").toString();
export const CESIUM_TOKEN = new EnvVar("VITE_CESIUM_TOKEN").toString();
export const COG_URL = new WindowVar("VITE_COG_URL").isUrl().toString();
export const TITILER_STATIC = new WindowVar("VITE_TITILER_STATIC")
  .isUrl()
  .toString();
export const LIVE_URL = new WindowVar("VITE_LIVE_URL").isUrl().toString();
export const RTMP_URL = new WindowVar("VITE_RTMP_URL").isUrl().toString();
export const PUBLIC_URL = new WindowVar("VITE_PUBLIC_URL").isUrl().toString();
export const STATIC_URL = new WindowVar("VITE_STATIC_URL").isUrl().toString();
export const API_URL = new WindowVar("VITE_API_URL").isUrl().toString();

export enum Mode {
  Prod = "production",
  Dev = "development",
}
export const ENV = new WindowVar("VITE_ENV").isEnum(Mode).toEnum<Mode>();
export const SITE_KEY = new EnvVar("VITE_SITE_KEY").toString();
export const SECRET_KEY = new EnvVar("VITE_SECRET_KEY").toString();
export const VERSION = new EnvVar("VITE_VERSION").toString();

export enum Instance {
  ARU = "aru",
  NKDA = "nkda",
}
export const INSTANCE = new WindowVar("VITE_INSTANCE")
  .isEnum(Instance)
  .toEnum<Instance>();
