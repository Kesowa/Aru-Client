const checkEnum = (e: Record<string, string>) => (val: string) =>
  Object.values(e).includes(val);

const castEnum = <T>(val: string) => val as unknown as T;

const checkUrl = (val: string) => {
  if (val.endsWith("/")) {
    return false;
  }
  return true;
};

const castUrl = (val: string) => new URL(val);

class EnvVar {
  key: string;
  val: string;
  constructor(key: string) {
    this.key = key;
    let val: string | undefined = undefined;
    if (val === undefined) val = process.env[key];
    if (val === undefined || val.length === 0) throw new EnvError(key, val);
    this.val = val;
  }
  isUrl() {
    return this.check(checkUrl);
  }
  isEnum(e: Record<string, string>) {
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

class EnvError extends Error {
  constructor(key: string, val: undefined | string) {
    super();
    this.message = `No value ${val} found for key ${key}`;
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

export const CLIENT_URL = "http://localhost:3000";
