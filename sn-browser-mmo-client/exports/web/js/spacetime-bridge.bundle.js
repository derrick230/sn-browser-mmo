// SpacetimeDB Bridge Bundle - Auto-generated

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray2;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1)
          validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray2(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/spacetimedb/dist/index.browser.mjs
  var import_base64_js = __toESM(require_base64_js(), 1);
  var _a;
  var TimeDuration = (_a = class {
    constructor(micros) {
      __publicField(this, "__time_duration_micros__");
      this.__time_duration_micros__ = micros;
    }
    /**
     * Get the algebraic type representation of the {@link TimeDuration} type.
     * @returns The algebraic type representation of the type.
     */
    static getAlgebraicType() {
      return AlgebraicType.Product({
        elements: [
          {
            name: "__time_duration_micros__",
            algebraicType: AlgebraicType.I64
          }
        ]
      });
    }
    static isTimeDuration(algebraicType) {
      if (algebraicType.tag !== "Product") {
        return false;
      }
      const elements = algebraicType.value.elements;
      if (elements.length !== 1) {
        return false;
      }
      const microsElement = elements[0];
      return microsElement.name === "__time_duration_micros__" && microsElement.algebraicType.tag === "I64";
    }
    get micros() {
      return this.__time_duration_micros__;
    }
    get millis() {
      return Number(this.micros / _a.MICROS_PER_MILLIS);
    }
    static fromMillis(millis) {
      return new _a(BigInt(millis) * _a.MICROS_PER_MILLIS);
    }
    /** This outputs the same string format that we use in the host and in Rust modules */
    toString() {
      const micros = this.micros;
      const sign = micros < 0 ? "-" : "+";
      const pos = micros < 0 ? -micros : micros;
      const secs = pos / 1000000n;
      const micros_remaining = pos % 1000000n;
      return `${sign}${secs}.${String(micros_remaining).padStart(6, "0")}`;
    }
  }, __publicField(_a, "MICROS_PER_MILLIS", 1000n), _a);
  var _a2;
  var Timestamp = (_a2 = class {
    constructor(micros) {
      __publicField(this, "__timestamp_micros_since_unix_epoch__");
      this.__timestamp_micros_since_unix_epoch__ = micros;
    }
    get microsSinceUnixEpoch() {
      return this.__timestamp_micros_since_unix_epoch__;
    }
    /**
     * Get the algebraic type representation of the {@link Timestamp} type.
     * @returns The algebraic type representation of the type.
     */
    static getAlgebraicType() {
      return AlgebraicType.Product({
        elements: [
          {
            name: "__timestamp_micros_since_unix_epoch__",
            algebraicType: AlgebraicType.I64
          }
        ]
      });
    }
    static isTimestamp(algebraicType) {
      if (algebraicType.tag !== "Product") {
        return false;
      }
      const elements = algebraicType.value.elements;
      if (elements.length !== 1) {
        return false;
      }
      const microsElement = elements[0];
      return microsElement.name === "__timestamp_micros_since_unix_epoch__" && microsElement.algebraicType.tag === "I64";
    }
    /**
     * Get a `Timestamp` representing the execution environment's belief of the current moment in time.
     */
    static now() {
      return _a2.fromDate(/* @__PURE__ */ new Date());
    }
    /** Convert to milliseconds since Unix epoch. */
    toMillis() {
      return this.microsSinceUnixEpoch / 1000n;
    }
    /**
     * Get a `Timestamp` representing the same point in time as `date`.
     */
    static fromDate(date) {
      const millis = date.getTime();
      const micros = BigInt(millis) * _a2.MICROS_PER_MILLIS;
      return new _a2(micros);
    }
    /**
     * Get a `Date` representing approximately the same point in time as `this`.
     *
     * This method truncates to millisecond precision,
     * and throws `RangeError` if the `Timestamp` is outside the range representable as a `Date`.
     */
    toDate() {
      const micros = this.__timestamp_micros_since_unix_epoch__;
      const millis = micros / _a2.MICROS_PER_MILLIS;
      if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) {
        throw new RangeError(
          "Timestamp is outside of the representable range of JS's Date"
        );
      }
      return new Date(Number(millis));
    }
    since(other) {
      return new TimeDuration(
        this.__timestamp_micros_since_unix_epoch__ - other.__timestamp_micros_since_unix_epoch__
      );
    }
  }, __publicField(_a2, "MICROS_PER_MILLIS", 1000n), /**
   * The Unix epoch, the midnight at the beginning of January 1, 1970, UTC.
   */
  __publicField(_a2, "UNIX_EPOCH", new _a2(0n)), _a2);
  var _a3;
  var Uuid = (_a3 = class {
    /**
     * Create a UUID from a raw 128-bit value.
     *
     * @param u - Unsigned 128-bit integer
     * @throws {Error} If the value is outside the valid UUID range
     */
    constructor(u) {
      __publicField(this, "__uuid__");
      if (u < 0n || u > _a3.MAX_UUID_BIGINT) {
        throw new Error("Invalid UUID: must be between 0 and `MAX_UUID_BIGINT`");
      }
      this.__uuid__ = u;
    }
    /**
     * Create a UUID `v4` from explicit random bytes.
     *
     * This method assumes the bytes are already sufficiently random.
     * It only sets the appropriate bits for the UUID version and variant.
     *
     * @param bytes - Exactly 16 random bytes
     * @returns A UUID `v4`
     * @throws {Error} If `bytes.length !== 16`
     *
     * @example
     * ```ts
     * const randomBytes = new Uint8Array(16);
     * const uuid = Uuid.fromRandomBytesV4(randomBytes);
     *
     * console.assert(
     *   uuid.toString() === "00000000-0000-4000-8000-000000000000"
     * );
     * ```
     */
    static fromRandomBytesV4(bytes) {
      if (bytes.length !== 16)
        throw new Error("UUID v4 requires 16 bytes");
      const arr = new Uint8Array(bytes);
      arr[6] = arr[6] & 15 | 64;
      arr[8] = arr[8] & 63 | 128;
      return new _a3(_a3.bytesToBigInt(arr));
    }
    /**
     * Generate a UUID `v7` using a monotonic counter from `0` to `2^31 - 1`,
     * a timestamp, and 4 random bytes.
     *
     * The counter wraps around on overflow.
     *
     * The UUID `v7` is structured as follows:
     *
     * ```ascii
     * ┌───────────────────────────────────────────────┬───────────────────┐
     * | B0  | B1  | B2  | B3  | B4  | B5              |         B6        |
     * ├───────────────────────────────────────────────┼───────────────────┤
     * |                 unix_ts_ms                    |      version 7    |
     * └───────────────────────────────────────────────┴───────────────────┘
     * ┌──────────────┬─────────┬──────────────────┬───────────────────────┐
     * | B7           | B8      | B9  | B10 | B11  | B12 | B13 | B14 | B15 |
     * ├──────────────┼─────────┼──────────────────┼───────────────────────┤
     * | counter_high | variant |    counter_low   |        random         |
     * └──────────────┴─────────┴──────────────────┴───────────────────────┘
     * ```
     *
     * @param counter - Mutable monotonic counter (31-bit)
     * @param now - Timestamp since the Unix epoch
     * @param randomBytes - Exactly 4 random bytes
     * @returns A UUID `v7`
     *
     * @throws {Error} If the `counter` is negative
     * @throws {Error} If the `timestamp` is before the Unix epoch
     * @throws {Error} If `randomBytes.length !== 4`
     *
     * @example
     * ```ts
     * const now = Timestamp.fromMillis(1_686_000_000_000n);
     * const counter = { value: 1 };
     * const randomBytes = new Uint8Array(4);
     *
     * const uuid = Uuid.fromCounterV7(counter, now, randomBytes);
     *
     * console.assert(
     *   uuid.toString() === "0000647e-5180-7000-8000-000200000000"
     * );
     * ```
     */
    static fromCounterV7(counter, now, randomBytes) {
      if (randomBytes.length !== 4) {
        throw new Error("`fromCounterV7` requires `randomBytes.length == 4`");
      }
      if (counter.value < 0) {
        throw new Error("`fromCounterV7` uuid `counter` must be non-negative");
      }
      if (now.__timestamp_micros_since_unix_epoch__ < 0) {
        throw new Error("`fromCounterV7` `timestamp` before unix epoch");
      }
      const counterVal = counter.value;
      counter.value = counterVal + 1 & 2147483647;
      const tsMs = now.toMillis() & 0xffffffffffffn;
      const bytes = new Uint8Array(16);
      bytes[0] = Number(tsMs >> 40n & 0xffn);
      bytes[1] = Number(tsMs >> 32n & 0xffn);
      bytes[2] = Number(tsMs >> 24n & 0xffn);
      bytes[3] = Number(tsMs >> 16n & 0xffn);
      bytes[4] = Number(tsMs >> 8n & 0xffn);
      bytes[5] = Number(tsMs & 0xffn);
      bytes[7] = counterVal >>> 23 & 255;
      bytes[9] = counterVal >>> 15 & 255;
      bytes[10] = counterVal >>> 7 & 255;
      bytes[11] = (counterVal & 127) << 1 & 255;
      bytes[12] |= randomBytes[0] & 127;
      bytes[13] = randomBytes[1];
      bytes[14] = randomBytes[2];
      bytes[15] = randomBytes[3];
      bytes[6] = bytes[6] & 15 | 112;
      bytes[8] = bytes[8] & 63 | 128;
      return new _a3(_a3.bytesToBigInt(bytes));
    }
    /**
     * Parse a UUID from a string representation.
     *
     * @param s - UUID string
     * @returns Parsed UUID
     * @throws {Error} If the string is not a valid UUID
     *
     * @example
     * ```ts
     * const s = "01888d6e-5c00-7000-8000-000000000000";
     * const uuid = Uuid.parse(s);
     *
     * console.assert(uuid.toString() === s);
     * ```
     */
    static parse(s) {
      const hex = s.replace(/-/g, "");
      if (hex.length !== 32)
        throw new Error("Invalid hex UUID");
      let v = 0n;
      for (let i = 0; i < 32; i += 2) {
        v = v << 8n | BigInt(parseInt(hex.slice(i, i + 2), 16));
      }
      return new _a3(v);
    }
    /** Convert to string (hyphenated form). */
    toString() {
      const bytes = _a3.bigIntToBytes(this.__uuid__);
      const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
      return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
    }
    /** Convert to bigint (u128). */
    asBigInt() {
      return this.__uuid__;
    }
    /** Return a `Uint8Array` of 16 bytes. */
    toBytes() {
      return _a3.bigIntToBytes(this.__uuid__);
    }
    static bytesToBigInt(bytes) {
      let result = 0n;
      for (const b of bytes)
        result = result << 8n | BigInt(b);
      return result;
    }
    static bigIntToBytes(value) {
      const bytes = new Uint8Array(16);
      for (let i = 15; i >= 0; i--) {
        bytes[i] = Number(value & 0xffn);
        value >>= 8n;
      }
      return bytes;
    }
    /**
     * Returns the version of this UUID.
     *
     * This represents the algorithm used to generate the value.
     *
     * @returns A `UuidVersion`
     * @throws {Error} If the version field is not recognized
     */
    getVersion() {
      const version = this.toBytes()[6] >> 4 & 15;
      switch (version) {
        case 4:
          return "V4";
        case 7:
          return "V7";
        default:
          if (this == _a3.NIL) {
            return "Nil";
          }
          if (this == _a3.MAX) {
            return "Max";
          }
          throw new Error(`Unsupported UUID version: ${version}`);
      }
    }
    /**
     * Extract the monotonic counter from a UUIDv7.
     *
     * Intended for testing and diagnostics.
     * Behavior is undefined if called on a non-V7 UUID.
     *
     * @returns 31-bit counter value
     */
    getCounter() {
      const bytes = this.toBytes();
      const high = bytes[7];
      const mid1 = bytes[9];
      const mid2 = bytes[10];
      const low = bytes[11] >>> 1;
      return high << 23 | mid1 << 15 | mid2 << 7 | low | 0;
    }
    compareTo(other) {
      if (this.__uuid__ < other.__uuid__)
        return -1;
      if (this.__uuid__ > other.__uuid__)
        return 1;
      return 0;
    }
    static getAlgebraicType() {
      return AlgebraicType.Product({
        elements: [
          {
            name: "__uuid__",
            algebraicType: AlgebraicType.U128
          }
        ]
      });
    }
  }, /**
   * The nil UUID (all zeros).
   *
   * @example
   * ```ts
   * const uuid = Uuid.NIL;
   * console.assert(
   *   uuid.toString() === "00000000-0000-0000-0000-000000000000"
   * );
   * ```
   */
  __publicField(_a3, "NIL", new _a3(0n)), __publicField(_a3, "MAX_UUID_BIGINT", 0xffffffffffffffffffffffffffffffffn), /**
   * The max UUID (all ones).
   *
   * @example
   * ```ts
   * const uuid = Uuid.MAX;
   * console.assert(
   *   uuid.toString() === "ffffffff-ffff-ffff-ffff-ffffffffffff"
   * );
   * ```
   */
  __publicField(_a3, "MAX", new _a3(_a3.MAX_UUID_BIGINT)), _a3);
  var _buffer, _view, _offset, _expandBuffer, expandBuffer_fn, _a4;
  var BinaryWriter = (_a4 = class {
    constructor(size) {
      __privateAdd(this, _expandBuffer);
      __privateAdd(this, _buffer, void 0);
      __privateAdd(this, _view, void 0);
      __privateAdd(this, _offset, 0);
      __privateSet(this, _buffer, new Uint8Array(size));
      __privateSet(this, _view, new DataView(__privateGet(this, _buffer).buffer));
    }
    toBase64() {
      return (0, import_base64_js.fromByteArray)(__privateGet(this, _buffer).subarray(0, __privateGet(this, _offset)));
    }
    getBuffer() {
      return __privateGet(this, _buffer).slice(0, __privateGet(this, _offset));
    }
    get offset() {
      return __privateGet(this, _offset);
    }
    writeUInt8Array(value) {
      const length = value.length;
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 4 + length);
      this.writeU32(length);
      __privateGet(this, _buffer).set(value, __privateGet(this, _offset));
      __privateSet(this, _offset, __privateGet(this, _offset) + value.length);
    }
    writeBool(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 1);
      __privateGet(this, _view).setUint8(__privateGet(this, _offset), value ? 1 : 0);
      __privateSet(this, _offset, __privateGet(this, _offset) + 1);
    }
    writeByte(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 1);
      __privateGet(this, _view).setUint8(__privateGet(this, _offset), value);
      __privateSet(this, _offset, __privateGet(this, _offset) + 1);
    }
    writeI8(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 1);
      __privateGet(this, _view).setInt8(__privateGet(this, _offset), value);
      __privateSet(this, _offset, __privateGet(this, _offset) + 1);
    }
    writeU8(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 1);
      __privateGet(this, _view).setUint8(__privateGet(this, _offset), value);
      __privateSet(this, _offset, __privateGet(this, _offset) + 1);
    }
    writeI16(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 2);
      __privateGet(this, _view).setInt16(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 2);
    }
    writeU16(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 2);
      __privateGet(this, _view).setUint16(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 2);
    }
    writeI32(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 4);
      __privateGet(this, _view).setInt32(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 4);
    }
    writeU32(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 4);
      __privateGet(this, _view).setUint32(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 4);
    }
    writeI64(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 8);
      __privateGet(this, _view).setBigInt64(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 8);
    }
    writeU64(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 8);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 8);
    }
    writeU128(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 16);
      const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
      const upperPart = value >> BigInt(64);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset), lowerPart, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8, upperPart, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 16);
    }
    writeI128(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 16);
      const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
      const upperPart = value >> BigInt(64);
      __privateGet(this, _view).setBigInt64(__privateGet(this, _offset), lowerPart, true);
      __privateGet(this, _view).setBigInt64(__privateGet(this, _offset) + 8, upperPart, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 16);
    }
    writeU256(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 32);
      const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
      const p0 = value & low_64_mask;
      const p1 = value >> BigInt(64 * 1) & low_64_mask;
      const p2 = value >> BigInt(64 * 2) & low_64_mask;
      const p3 = value >> BigInt(64 * 3);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 0, p0, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 1, p1, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 2, p2, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 3, p3, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 32);
    }
    writeI256(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 32);
      const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
      const p0 = value & low_64_mask;
      const p1 = value >> BigInt(64 * 1) & low_64_mask;
      const p2 = value >> BigInt(64 * 2) & low_64_mask;
      const p3 = value >> BigInt(64 * 3);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 0, p0, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 1, p1, true);
      __privateGet(this, _view).setBigUint64(__privateGet(this, _offset) + 8 * 2, p2, true);
      __privateGet(this, _view).setBigInt64(__privateGet(this, _offset) + 8 * 3, p3, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 32);
    }
    writeF32(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 4);
      __privateGet(this, _view).setFloat32(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 4);
    }
    writeF64(value) {
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, 8);
      __privateGet(this, _view).setFloat64(__privateGet(this, _offset), value, true);
      __privateSet(this, _offset, __privateGet(this, _offset) + 8);
    }
    writeString(value) {
      const encoder = new TextEncoder();
      const encodedString = encoder.encode(value);
      this.writeU32(encodedString.length);
      __privateMethod(this, _expandBuffer, expandBuffer_fn).call(this, encodedString.length);
      __privateGet(this, _buffer).set(encodedString, __privateGet(this, _offset));
      __privateSet(this, _offset, __privateGet(this, _offset) + encodedString.length);
    }
  }, _buffer = new WeakMap(), _view = new WeakMap(), _offset = new WeakMap(), _expandBuffer = new WeakSet(), expandBuffer_fn = function(additionalCapacity) {
    const minCapacity = __privateGet(this, _offset) + additionalCapacity + 1;
    if (minCapacity <= __privateGet(this, _buffer).length)
      return;
    let newCapacity = __privateGet(this, _buffer).length * 2;
    if (newCapacity < minCapacity)
      newCapacity = minCapacity;
    const newBuffer = new Uint8Array(newCapacity);
    newBuffer.set(__privateGet(this, _buffer));
    __privateSet(this, _buffer, newBuffer);
    __privateSet(this, _view, new DataView(__privateGet(this, _buffer).buffer));
  }, _a4);
  var _view2, _offset2, _ensure, ensure_fn, _a5;
  var BinaryReader = (_a5 = class {
    constructor(input) {
      /** Ensure we have at least `n` bytes left to read */
      __privateAdd(this, _ensure);
      /**
       * The DataView used to read values from the binary data.
       *
       * Note: The DataView's `byteOffset` is relative to the beginning of the
       * underlying ArrayBuffer, not the start of the provided Uint8Array input.
       * This `BinaryReader`'s `#offset` field is used to track the current read position
       * relative to the start of the provided Uint8Array input.
       */
      __privateAdd(this, _view2, void 0);
      /**
       * Represents the offset (in bytes) relative to the start of the DataView
       * and provided Uint8Array input.
       *
       * Note: This is *not* the absolute byte offset within the underlying ArrayBuffer.
       */
      __privateAdd(this, _offset2, 0);
      __privateSet(this, _view2, new DataView(input.buffer, input.byteOffset, input.byteLength));
      __privateSet(this, _offset2, 0);
    }
    get offset() {
      return __privateGet(this, _offset2);
    }
    get remaining() {
      return __privateGet(this, _view2).byteLength - __privateGet(this, _offset2);
    }
    readUInt8Array() {
      const length = this.readU32();
      __privateMethod(this, _ensure, ensure_fn).call(this, length);
      return this.readBytes(length);
    }
    readBool() {
      const value = __privateGet(this, _view2).getUint8(__privateGet(this, _offset2));
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 1);
      return value !== 0;
    }
    readByte() {
      const value = __privateGet(this, _view2).getUint8(__privateGet(this, _offset2));
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 1);
      return value;
    }
    readBytes(length) {
      const array = new Uint8Array(
        __privateGet(this, _view2).buffer,
        __privateGet(this, _view2).byteOffset + __privateGet(this, _offset2),
        length
      );
      __privateSet(this, _offset2, __privateGet(this, _offset2) + length);
      return array;
    }
    readI8() {
      const value = __privateGet(this, _view2).getInt8(__privateGet(this, _offset2));
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 1);
      return value;
    }
    readU8() {
      return this.readByte();
    }
    readI16() {
      const value = __privateGet(this, _view2).getInt16(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 2);
      return value;
    }
    readU16() {
      const value = __privateGet(this, _view2).getUint16(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 2);
      return value;
    }
    readI32() {
      const value = __privateGet(this, _view2).getInt32(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 4);
      return value;
    }
    readU32() {
      const value = __privateGet(this, _view2).getUint32(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 4);
      return value;
    }
    readI64() {
      const value = __privateGet(this, _view2).getBigInt64(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 8);
      return value;
    }
    readU64() {
      const value = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 8);
      return value;
    }
    readU128() {
      const lowerPart = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      const upperPart = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 8, true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 16);
      return (upperPart << BigInt(64)) + lowerPart;
    }
    readI128() {
      const lowerPart = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      const upperPart = __privateGet(this, _view2).getBigInt64(__privateGet(this, _offset2) + 8, true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 16);
      return (upperPart << BigInt(64)) + lowerPart;
    }
    readU256() {
      const p0 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      const p1 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 8, true);
      const p2 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 16, true);
      const p3 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 24, true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 32);
      return (p3 << BigInt(3 * 64)) + (p2 << BigInt(2 * 64)) + (p1 << BigInt(1 * 64)) + p0;
    }
    readI256() {
      const p0 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2), true);
      const p1 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 8, true);
      const p2 = __privateGet(this, _view2).getBigUint64(__privateGet(this, _offset2) + 16, true);
      const p3 = __privateGet(this, _view2).getBigInt64(__privateGet(this, _offset2) + 24, true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 32);
      return (p3 << BigInt(3 * 64)) + (p2 << BigInt(2 * 64)) + (p1 << BigInt(1 * 64)) + p0;
    }
    readF32() {
      const value = __privateGet(this, _view2).getFloat32(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 4);
      return value;
    }
    readF64() {
      const value = __privateGet(this, _view2).getFloat64(__privateGet(this, _offset2), true);
      __privateSet(this, _offset2, __privateGet(this, _offset2) + 8);
      return value;
    }
    readString() {
      const uint8Array = this.readUInt8Array();
      return new TextDecoder("utf-8").decode(uint8Array);
    }
  }, _view2 = new WeakMap(), _offset2 = new WeakMap(), _ensure = new WeakSet(), ensure_fn = function(n) {
    if (__privateGet(this, _offset2) + n > __privateGet(this, _view2).byteLength) {
      throw new RangeError(
        `Tried to read ${n} byte(s) at relative offset ${__privateGet(this, _offset2)}, but only ${this.remaining} byte(s) remain`
      );
    }
  }, _a5);
  function toPascalCase(s) {
    const str = s.replace(/([-_][a-z])/gi, ($1) => {
      return $1.toUpperCase().replace("-", "").replace("_", "");
    });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  function deepEqual(obj1, obj2) {
    if (obj1 === obj2)
      return true;
    if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
      return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length)
      return false;
    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }
  function uint8ArrayToHexString(array) {
    return Array.prototype.map.call(array.reverse(), (x) => ("00" + x.toString(16)).slice(-2)).join("");
  }
  function uint8ArrayToU128(array) {
    if (array.length != 16) {
      throw new Error(`Uint8Array is not 16 bytes long: ${array}`);
    }
    return new BinaryReader(array).readU128();
  }
  function uint8ArrayToU256(array) {
    if (array.length != 32) {
      throw new Error(`Uint8Array is not 32 bytes long: [${array}]`);
    }
    return new BinaryReader(array).readU256();
  }
  function hexStringToUint8Array(str) {
    if (str.startsWith("0x")) {
      str = str.slice(2);
    }
    const matches = str.match(/.{1,2}/g) || [];
    const data = Uint8Array.from(
      matches.map((byte) => parseInt(byte, 16))
    );
    return data.reverse();
  }
  function hexStringToU128(str) {
    return uint8ArrayToU128(hexStringToUint8Array(str));
  }
  function hexStringToU256(str) {
    return uint8ArrayToU256(hexStringToUint8Array(str));
  }
  function u128ToUint8Array(data) {
    const writer = new BinaryWriter(16);
    writer.writeU128(data);
    return writer.getBuffer();
  }
  function u128ToHexString(data) {
    return uint8ArrayToHexString(u128ToUint8Array(data));
  }
  function u256ToUint8Array(data) {
    const writer = new BinaryWriter(32);
    writer.writeU256(data);
    return writer.getBuffer();
  }
  function u256ToHexString(data) {
    return uint8ArrayToHexString(u256ToUint8Array(data));
  }
  function toCamelCase(str) {
    return str.replace(/[-_]+/g, "_").replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
  }
  function bsatnBaseSize(typespace, ty) {
    const assumedArrayLength = 4;
    while (ty.tag === "Ref")
      ty = typespace.types[ty.value];
    if (ty.tag === "Product") {
      let sum = 0;
      for (const { algebraicType: elem } of ty.value.elements) {
        sum += bsatnBaseSize(typespace, elem);
      }
      return sum;
    } else if (ty.tag === "Sum") {
      let min = Infinity;
      for (const { algebraicType: vari } of ty.value.variants) {
        const vSize = bsatnBaseSize(typespace, vari);
        if (vSize < min)
          min = vSize;
      }
      if (min === Infinity)
        min = 0;
      return 4 + min;
    } else if (ty.tag == "Array") {
      return 4 + assumedArrayLength * bsatnBaseSize(typespace, ty.value);
    }
    return {
      String: 4 + assumedArrayLength,
      Sum: 1,
      Bool: 1,
      I8: 1,
      U8: 1,
      I16: 2,
      U16: 2,
      I32: 4,
      U32: 4,
      F32: 4,
      I64: 8,
      U64: 8,
      F64: 8,
      I128: 16,
      U128: 16,
      I256: 32,
      U256: 32
    }[ty.tag];
  }
  var Identity = class _Identity {
    /**
     * Creates a new `Identity`.
     *
     * `data` can be a hexadecimal string or a `bigint`.
     */
    constructor(data) {
      __publicField(this, "__identity__");
      this.__identity__ = typeof data === "string" ? hexStringToU256(data) : data;
    }
    /**
     * Get the algebraic type representation of the {@link Identity} type.
     * @returns The algebraic type representation of the type.
     */
    static getAlgebraicType() {
      return AlgebraicType.Product({
        elements: [{ name: "__identity__", algebraicType: AlgebraicType.U256 }]
      });
    }
    /**
     * Check if two identities are equal.
     */
    isEqual(other) {
      return this.toHexString() === other.toHexString();
    }
    /**
     * Check if two identities are equal.
     */
    equals(other) {
      return this.isEqual(other);
    }
    /**
     * Print the identity as a hexadecimal string.
     */
    toHexString() {
      return u256ToHexString(this.__identity__);
    }
    /**
     * Convert the address to a Uint8Array.
     */
    toUint8Array() {
      return u256ToUint8Array(this.__identity__);
    }
    /**
     * Parse an Identity from a hexadecimal string.
     */
    static fromString(str) {
      return new _Identity(str);
    }
    /**
     * Zero identity (0x0000000000000000000000000000000000000000000000000000000000000000)
     */
    static zero() {
      return new _Identity(0n);
    }
    toString() {
      return this.toHexString();
    }
  };
  var AlgebraicType = {
    Ref: (value) => ({ tag: "Ref", value }),
    Sum: (value) => ({
      tag: "Sum",
      value
    }),
    Product: (value) => ({
      tag: "Product",
      value
    }),
    Array: (value) => ({
      tag: "Array",
      value
    }),
    String: { tag: "String" },
    Bool: { tag: "Bool" },
    I8: { tag: "I8" },
    U8: { tag: "U8" },
    I16: { tag: "I16" },
    U16: { tag: "U16" },
    I32: { tag: "I32" },
    U32: { tag: "U32" },
    I64: { tag: "I64" },
    U64: { tag: "U64" },
    I128: { tag: "I128" },
    U128: { tag: "U128" },
    I256: { tag: "I256" },
    U256: { tag: "U256" },
    F32: { tag: "F32" },
    F64: { tag: "F64" },
    serializeValue(writer, ty, value, typespace) {
      if (ty.tag === "Ref") {
        if (!typespace)
          throw new Error("cannot serialize refs without a typespace");
        while (ty.tag === "Ref")
          ty = typespace.types[ty.value];
      }
      switch (ty.tag) {
        case "Product":
          ProductType.serializeValue(writer, ty.value, value, typespace);
          break;
        case "Sum":
          SumType.serializeValue(writer, ty.value, value, typespace);
          break;
        case "Array":
          if (ty.value.tag === "U8") {
            writer.writeUInt8Array(value);
          } else {
            const elemType = ty.value;
            writer.writeU32(value.length);
            for (const elem of value) {
              AlgebraicType.serializeValue(writer, elemType, elem, typespace);
            }
          }
          break;
        case "Bool":
          writer.writeBool(value);
          break;
        case "I8":
          writer.writeI8(value);
          break;
        case "U8":
          writer.writeU8(value);
          break;
        case "I16":
          writer.writeI16(value);
          break;
        case "U16":
          writer.writeU16(value);
          break;
        case "I32":
          writer.writeI32(value);
          break;
        case "U32":
          writer.writeU32(value);
          break;
        case "I64":
          writer.writeI64(value);
          break;
        case "U64":
          writer.writeU64(value);
          break;
        case "I128":
          writer.writeI128(value);
          break;
        case "U128":
          writer.writeU128(value);
          break;
        case "I256":
          writer.writeI256(value);
          break;
        case "U256":
          writer.writeU256(value);
          break;
        case "F32":
          writer.writeF32(value);
          break;
        case "F64":
          writer.writeF64(value);
          break;
        case "String":
          writer.writeString(value);
          break;
      }
    },
    deserializeValue: function(reader, ty, typespace) {
      if (ty.tag === "Ref") {
        if (!typespace)
          throw new Error("cannot deserialize refs without a typespace");
        while (ty.tag === "Ref")
          ty = typespace.types[ty.value];
      }
      switch (ty.tag) {
        case "Product":
          return ProductType.deserializeValue(reader, ty.value, typespace);
        case "Sum":
          return SumType.deserializeValue(reader, ty.value, typespace);
        case "Array":
          if (ty.value.tag === "U8") {
            return reader.readUInt8Array();
          } else {
            const elemType = ty.value;
            const length = reader.readU32();
            const result = [];
            for (let i = 0; i < length; i++) {
              result.push(
                AlgebraicType.deserializeValue(reader, elemType, typespace)
              );
            }
            return result;
          }
        case "Bool":
          return reader.readBool();
        case "I8":
          return reader.readI8();
        case "U8":
          return reader.readU8();
        case "I16":
          return reader.readI16();
        case "U16":
          return reader.readU16();
        case "I32":
          return reader.readI32();
        case "U32":
          return reader.readU32();
        case "I64":
          return reader.readI64();
        case "U64":
          return reader.readU64();
        case "I128":
          return reader.readI128();
        case "U128":
          return reader.readU128();
        case "I256":
          return reader.readI256();
        case "U256":
          return reader.readU256();
        case "F32":
          return reader.readF32();
        case "F64":
          return reader.readF64();
        case "String":
          return reader.readString();
      }
    },
    /**
     * Convert a value of the algebraic type into something that can be used as a key in a map.
     * There are no guarantees about being able to order it.
     * This is only guaranteed to be comparable to other values of the same type.
     * @param value A value of the algebraic type
     * @returns Something that can be used as a key in a map.
     */
    intoMapKey: function(ty, value) {
      switch (ty.tag) {
        case "U8":
        case "U16":
        case "U32":
        case "U64":
        case "U128":
        case "U256":
        case "I8":
        case "I16":
        case "I32":
        case "I64":
        case "I128":
        case "I256":
        case "F32":
        case "F64":
        case "String":
        case "Bool":
          return value;
        case "Product":
          return ProductType.intoMapKey(ty.value, value);
        default: {
          const writer = new BinaryWriter(10);
          AlgebraicType.serializeValue(writer, ty, value);
          return writer.toBase64();
        }
      }
    }
  };
  var ProductType = {
    serializeValue(writer, ty, value, typespace) {
      for (const element of ty.elements) {
        AlgebraicType.serializeValue(
          writer,
          element.algebraicType,
          value[element.name],
          typespace
        );
      }
    },
    deserializeValue(reader, ty, typespace) {
      const result = {};
      if (ty.elements.length === 1) {
        if (ty.elements[0].name === "__time_duration_micros__") {
          return new TimeDuration(reader.readI64());
        }
        if (ty.elements[0].name === "__timestamp_micros_since_unix_epoch__") {
          return new Timestamp(reader.readI64());
        }
        if (ty.elements[0].name === "__identity__") {
          return new Identity(reader.readU256());
        }
        if (ty.elements[0].name === "__connection_id__") {
          return new ConnectionId(reader.readU128());
        }
        if (ty.elements[0].name === "__uuid__") {
          return new Uuid(reader.readU128());
        }
      }
      for (const element of ty.elements) {
        result[element.name] = AlgebraicType.deserializeValue(
          reader,
          element.algebraicType,
          typespace
        );
      }
      return result;
    },
    intoMapKey(ty, value) {
      if (ty.elements.length === 1) {
        if (ty.elements[0].name === "__time_duration_micros__") {
          return value.__time_duration_micros__;
        }
        if (ty.elements[0].name === "__timestamp_micros_since_unix_epoch__") {
          return value.__timestamp_micros_since_unix_epoch__;
        }
        if (ty.elements[0].name === "__identity__") {
          return value.__identity__;
        }
        if (ty.elements[0].name === "__connection_id__") {
          return value.__connection_id__;
        }
        if (ty.elements[0].name === "__uuid__") {
          return value.__uuid__;
        }
      }
      const writer = new BinaryWriter(10);
      AlgebraicType.serializeValue(writer, AlgebraicType.Product(ty), value);
      return writer.toBase64();
    }
  };
  var SumType = {
    serializeValue: function(writer, ty, value, typespace) {
      if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
        if (value !== null && value !== void 0) {
          writer.writeByte(0);
          AlgebraicType.serializeValue(
            writer,
            ty.variants[0].algebraicType,
            value,
            typespace
          );
        } else {
          writer.writeByte(1);
        }
      } else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
        let variantName;
        let innerValue;
        let index;
        if ("ok" in value) {
          variantName = "ok";
          innerValue = value.ok;
          index = 0;
        } else {
          variantName = "err";
          innerValue = value.err;
          index = 1;
        }
        if (index < 0) {
          throw `Result serialization error: variant '${variantName}' not found in ${JSON.stringify(ty)}`;
        }
        writer.writeU8(index);
        AlgebraicType.serializeValue(
          writer,
          ty.variants[index].algebraicType,
          innerValue,
          typespace
        );
      } else {
        const variant = value["tag"];
        const index = ty.variants.findIndex((v) => v.name === variant);
        if (index < 0) {
          throw `Can't serialize a sum type, couldn't find ${value.tag} tag ${JSON.stringify(value)} in variants ${JSON.stringify(ty)}`;
        }
        writer.writeU8(index);
        AlgebraicType.serializeValue(
          writer,
          ty.variants[index].algebraicType,
          value["value"],
          typespace
        );
      }
    },
    deserializeValue: function(reader, ty, typespace) {
      const tag = reader.readU8();
      if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
        if (tag === 0) {
          return AlgebraicType.deserializeValue(
            reader,
            ty.variants[0].algebraicType,
            typespace
          );
        } else if (tag === 1) {
          return void 0;
        } else {
          throw `Can't deserialize an option type, couldn't find ${tag} tag`;
        }
      } else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
        if (tag === 0) {
          const value = AlgebraicType.deserializeValue(
            reader,
            ty.variants[0].algebraicType,
            typespace
          );
          return { ok: value };
        } else if (tag === 1) {
          const value = AlgebraicType.deserializeValue(
            reader,
            ty.variants[1].algebraicType,
            typespace
          );
          return { err: value };
        } else {
          throw `Can't deserialize a result type, couldn't find ${tag} tag`;
        }
      } else {
        const variant = ty.variants[tag];
        const value = AlgebraicType.deserializeValue(
          reader,
          variant.algebraicType,
          typespace
        );
        return { tag: variant.name, value };
      }
    }
  };
  var ConnectionId = class _ConnectionId {
    /**
     * Creates a new `ConnectionId`.
     */
    constructor(data) {
      __publicField(this, "__connection_id__");
      this.__connection_id__ = data;
    }
    /**
     * Get the algebraic type representation of the {@link ConnectionId} type.
     * @returns The algebraic type representation of the type.
     */
    static getAlgebraicType() {
      return AlgebraicType.Product({
        elements: [
          { name: "__connection_id__", algebraicType: AlgebraicType.U128 }
        ]
      });
    }
    isZero() {
      return this.__connection_id__ === BigInt(0);
    }
    static nullIfZero(addr) {
      if (addr.isZero()) {
        return null;
      } else {
        return addr;
      }
    }
    static random() {
      function randomU8() {
        return Math.floor(Math.random() * 255);
      }
      let result = BigInt(0);
      for (let i = 0; i < 16; i++) {
        result = result << BigInt(8) | BigInt(randomU8());
      }
      return new _ConnectionId(result);
    }
    /**
     * Compare two connection IDs for equality.
     */
    isEqual(other) {
      return this.__connection_id__ == other.__connection_id__;
    }
    /**
     * Check if two connection IDs are equal.
     */
    equals(other) {
      return this.isEqual(other);
    }
    /**
     * Print the connection ID as a hexadecimal string.
     */
    toHexString() {
      return u128ToHexString(this.__connection_id__);
    }
    /**
     * Convert the connection ID to a Uint8Array.
     */
    toUint8Array() {
      return u128ToUint8Array(this.__connection_id__);
    }
    /**
     * Parse a connection ID from a hexadecimal string.
     */
    static fromString(str) {
      return new _ConnectionId(hexStringToU128(str));
    }
    static fromStringOrNull(str) {
      const addr = _ConnectionId.fromString(str);
      if (addr.isZero()) {
        return null;
      } else {
        return addr;
      }
    }
  };
  var ScheduleAt = {
    interval(value) {
      return Interval(value);
    },
    time(value) {
      return Time(value);
    },
    getAlgebraicType() {
      return AlgebraicType.Sum({
        variants: [
          {
            name: "Interval",
            algebraicType: TimeDuration.getAlgebraicType()
          },
          { name: "Time", algebraicType: Timestamp.getAlgebraicType() }
        ]
      });
    },
    isScheduleAt(algebraicType) {
      if (algebraicType.tag !== "Sum") {
        return false;
      }
      const variants = algebraicType.value.variants;
      if (variants.length !== 2) {
        return false;
      }
      const intervalVariant = variants.find((v) => v.name === "Interval");
      const timeVariant = variants.find((v) => v.name === "Time");
      if (!intervalVariant || !timeVariant) {
        return false;
      }
      return TimeDuration.isTimeDuration(intervalVariant.algebraicType) && Timestamp.isTimestamp(timeVariant.algebraicType);
    }
  };
  var Interval = (micros) => ({
    tag: "Interval",
    value: new TimeDuration(micros)
  });
  var Time = (microsSinceUnixEpoch) => ({
    tag: "Time",
    value: new Timestamp(microsSinceUnixEpoch)
  });
  var schedule_at_default = ScheduleAt;
  var Option = {
    getAlgebraicType(innerType) {
      return AlgebraicType.Sum({
        variants: [
          { name: "some", algebraicType: innerType },
          {
            name: "none",
            algebraicType: AlgebraicType.Product({ elements: [] })
          }
        ]
      });
    }
  };
  var Result = {
    getAlgebraicType(okType, errType) {
      return AlgebraicType.Sum({
        variants: [
          { name: "ok", algebraicType: okType },
          { name: "err", algebraicType: errType }
        ]
      });
    }
  };
  function set(x, t2) {
    return { ...x, ...t2 };
  }
  var TypeBuilder = class {
    constructor(algebraicType) {
      /**
       * The TypeScript phantom type. This is not stored at runtime,
       * but is visible to the compiler
       */
      __publicField(this, "type");
      /**
       * The SpacetimeDB algebraic type (run‑time value). In addition to storing
       * the runtime representation of the `AlgebraicType`, it also captures
       * the TypeScript type information of the `AlgebraicType`. That is to say
       * the value is not merely an `AlgebraicType`, but is constructed to be
       * the corresponding concrete `AlgebraicType` for the TypeScript type `Type`.
       *
       * e.g. `string` corresponds to `AlgebraicType.String`
       */
      __publicField(this, "algebraicType");
      this.algebraicType = algebraicType;
    }
    optional() {
      return new OptionBuilder(this);
    }
    serialize(writer, value) {
      AlgebraicType.serializeValue(writer, this.algebraicType, value);
    }
    deserialize(reader) {
      return AlgebraicType.deserializeValue(reader, this.algebraicType);
    }
  };
  var U8Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U8);
    }
    index(algorithm = "btree") {
      return new U8ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new U8ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U8ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U8ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new U8ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var U16Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U16);
    }
    index(algorithm = "btree") {
      return new U16ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new U16ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U16ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U16ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new U16ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var U32Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U32);
    }
    index(algorithm = "btree") {
      return new U32ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new U32ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U32ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U32ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new U32ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var U64Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U64);
    }
    index(algorithm = "btree") {
      return new U64ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new U64ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U64ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U64ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new U64ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var U128Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U128);
    }
    index(algorithm = "btree") {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U128ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new U128ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var U256Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.U256);
    }
    index(algorithm = "btree") {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new U256ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new U256ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var I8Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I8);
    }
    index(algorithm = "btree") {
      return new I8ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new I8ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I8ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I8ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new I8ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var I16Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I16);
    }
    index(algorithm = "btree") {
      return new I16ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new I16ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I16ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I16ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new I16ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var I32Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I32);
    }
    index(algorithm = "btree") {
      return new I32ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new I32ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I32ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I32ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new I32ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var I64Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I64);
    }
    index(algorithm = "btree") {
      return new I64ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
    }
    primaryKey() {
      return new I64ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I64ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I64ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new I64ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var I128Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I128);
    }
    index(algorithm = "btree") {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I128ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new I128ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var I256Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.I256);
    }
    index(algorithm = "btree") {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new I256ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new I256ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var F32Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.F32);
    }
    default(value) {
      return new F32ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new F32ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var F64Builder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.F64);
    }
    default(value) {
      return new F64ColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new F64ColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var BoolBuilder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.Bool);
    }
    index(algorithm = "btree") {
      return new BoolColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new BoolColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new BoolColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new BoolColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new BoolColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var StringBuilder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.String);
    }
    index(algorithm = "btree") {
      return new StringColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new StringColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new StringColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new StringColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new StringColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var ArrayBuilder = class extends TypeBuilder {
    constructor(element) {
      super(AlgebraicType.Array(element.algebraicType));
      __publicField(this, "element");
      this.element = element;
    }
    default(value) {
      return new ArrayColumnBuilder(
        this.element,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new ArrayColumnBuilder(this.element, set(defaultMetadata, { name }));
    }
  };
  var ByteArrayBuilder = class extends TypeBuilder {
    constructor() {
      super(AlgebraicType.Array(AlgebraicType.U8));
    }
    default(value) {
      return new ByteArrayColumnBuilder(
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new ByteArrayColumnBuilder(set(defaultMetadata, { name }));
    }
  };
  var OptionBuilder = class extends TypeBuilder {
    constructor(value) {
      super(Option.getAlgebraicType(value.algebraicType));
      __publicField(this, "value");
      this.value = value;
    }
    default(value) {
      return new OptionColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new OptionColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var ProductBuilder = class extends TypeBuilder {
    constructor(elements, name) {
      function elementsArrayFromElementsObj(obj) {
        return Object.keys(obj).map((key) => ({
          name: key,
          // Lazily resolve the underlying object's algebraicType.
          // This will call obj[key].algebraicType only when someone
          // actually reads this property.
          get algebraicType() {
            return obj[key].algebraicType;
          }
        }));
      }
      super(
        AlgebraicType.Product({
          elements: elementsArrayFromElementsObj(elements)
        })
      );
      __publicField(this, "typeName");
      __publicField(this, "elements");
      this.typeName = name;
      this.elements = elements;
    }
    default(value) {
      return new ProductColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new ProductColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var ResultBuilder = class extends TypeBuilder {
    constructor(ok, err) {
      super(Result.getAlgebraicType(ok.algebraicType, err.algebraicType));
      __publicField(this, "ok");
      __publicField(this, "err");
      this.ok = ok;
      this.err = err;
    }
    default(value) {
      return new ResultColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
    }
  };
  var UnitBuilder = class extends TypeBuilder {
    constructor() {
      super({ tag: "Product", value: { elements: [] } });
    }
  };
  var RowBuilder = class extends TypeBuilder {
    constructor(row, name) {
      const mappedRow = Object.fromEntries(
        Object.entries(row).map(([colName, builder]) => [
          colName,
          builder instanceof ColumnBuilder ? builder : new ColumnBuilder(builder, {})
        ])
      );
      const elements = Object.keys(mappedRow).map((name2) => ({
        name: name2,
        get algebraicType() {
          return mappedRow[name2].typeBuilder.algebraicType;
        }
      }));
      super(AlgebraicType.Product({ elements }));
      __publicField(this, "row");
      __publicField(this, "typeName");
      this.row = mappedRow;
      this.typeName = name;
    }
  };
  var SumBuilderImpl = class extends TypeBuilder {
    constructor(variants, name) {
      function variantsArrayFromVariantsObj(variants2) {
        return Object.keys(variants2).map((key) => ({
          name: key,
          // Lazily resolve the underlying object's algebraicType.
          // This will call obj[key].algebraicType only when someone
          // actually reads this property.
          get algebraicType() {
            return variants2[key].algebraicType;
          }
        }));
      }
      super(
        AlgebraicType.Sum({
          variants: variantsArrayFromVariantsObj(variants)
        })
      );
      __publicField(this, "variants");
      __publicField(this, "typeName");
      this.variants = variants;
      this.typeName = name;
      for (const key of Object.keys(variants)) {
        const desc = Object.getOwnPropertyDescriptor(variants, key);
        const isAccessor = !!desc && (typeof desc.get === "function" || typeof desc.set === "function");
        let isUnit2 = false;
        if (!isAccessor) {
          const variant = variants[key];
          isUnit2 = variant instanceof UnitBuilder;
        }
        if (isUnit2) {
          const constant = this.create(key);
          Object.defineProperty(this, key, {
            value: constant,
            writable: false,
            enumerable: true,
            configurable: false
          });
        } else {
          const fn = (value) => this.create(key, value);
          Object.defineProperty(this, key, {
            value: fn,
            writable: false,
            enumerable: true,
            configurable: false
          });
        }
      }
    }
    create(tag, value) {
      return value === void 0 ? { tag } : { tag, value };
    }
    default(value) {
      return new SumColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new SumColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var SumBuilder = SumBuilderImpl;
  var SimpleSumBuilderImpl = class extends SumBuilderImpl {
    index(algorithm = "btree") {
      return new SimpleSumColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    primaryKey() {
      return new SimpleSumColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
  };
  var ScheduleAtBuilder = class extends TypeBuilder {
    constructor() {
      super(schedule_at_default.getAlgebraicType());
    }
    default(value) {
      return new ScheduleAtColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var IdentityBuilder = class extends TypeBuilder {
    constructor() {
      super(Identity.getAlgebraicType());
    }
    index(algorithm = "btree") {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new IdentityColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new IdentityColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var ConnectionIdBuilder = class extends TypeBuilder {
    constructor() {
      super(ConnectionId.getAlgebraicType());
    }
    index(algorithm = "btree") {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new ConnectionIdColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var TimestampBuilder = class extends TypeBuilder {
    constructor() {
      super(Timestamp.getAlgebraicType());
    }
    index(algorithm = "btree") {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new TimestampColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new TimestampColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var TimeDurationBuilder = class extends TypeBuilder {
    constructor() {
      super(TimeDuration.getAlgebraicType());
    }
    index(algorithm = "btree") {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new TimeDurationColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new TimeDurationColumnBuilder(this, set(defaultMetadata, { name }));
    }
  };
  var UuidBuilder = class extends TypeBuilder {
    constructor() {
      super(Uuid.getAlgebraicType());
    }
    index(algorithm = "btree") {
      return new UuidColumnBuilder(
        this,
        set(defaultMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new UuidColumnBuilder(
        this,
        set(defaultMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new UuidColumnBuilder(
        this,
        set(defaultMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new UuidColumnBuilder(
        this,
        set(defaultMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new UuidColumnBuilder(
        this,
        set(defaultMetadata, { defaultValue: value })
      );
    }
  };
  var defaultMetadata = {};
  var ColumnBuilder = class {
    constructor(typeBuilder, metadata) {
      __publicField(this, "typeBuilder");
      __publicField(this, "columnMetadata");
      this.typeBuilder = typeBuilder;
      this.columnMetadata = metadata;
    }
    serialize(writer, value) {
      AlgebraicType.serializeValue(writer, this.typeBuilder.algebraicType, value);
    }
    deserialize(reader) {
      return AlgebraicType.deserializeValue(
        reader,
        this.typeBuilder.algebraicType
      );
    }
  };
  var U8ColumnBuilder = class _U8ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _U8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var U16ColumnBuilder = class _U16ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _U16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var U32ColumnBuilder = class _U32ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _U32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var U64ColumnBuilder = class _U64ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _U64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var U128ColumnBuilder = class _U128ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _U128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var U256ColumnBuilder = class _U256ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _U256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var I8ColumnBuilder = class _I8ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _I8ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var I16ColumnBuilder = class _I16ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _I16ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var I32ColumnBuilder = class _I32ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _I32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var I64ColumnBuilder = class _I64ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _I64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var I128ColumnBuilder = class _I128ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _I128ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var I256ColumnBuilder = class _I256ColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    autoInc() {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isAutoIncrement: true })
      );
    }
    default(value) {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _I256ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var F32ColumnBuilder = class _F32ColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _F32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _F32ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var F64ColumnBuilder = class _F64ColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _F64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _F64ColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var BoolColumnBuilder = class _BoolColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _BoolColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _BoolColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _BoolColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _BoolColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _BoolColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var StringColumnBuilder = class _StringColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _StringColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _StringColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _StringColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _StringColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _StringColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var ArrayColumnBuilder = class _ArrayColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _ArrayColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _ArrayColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var ByteArrayColumnBuilder = class _ByteArrayColumnBuilder extends ColumnBuilder {
    constructor(metadata) {
      super(new TypeBuilder(AlgebraicType.Array(AlgebraicType.U8)), metadata);
    }
    default(value) {
      return new _ByteArrayColumnBuilder(
        set(this.columnMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new _ByteArrayColumnBuilder(set(this.columnMetadata, { name }));
    }
  };
  var OptionColumnBuilder = class _OptionColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _OptionColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
    name(name) {
      return new _OptionColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var ResultColumnBuilder = class _ResultColumnBuilder extends ColumnBuilder {
    constructor(typeBuilder, metadata) {
      super(typeBuilder, metadata);
    }
    default(value) {
      return new _ResultColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, {
          defaultValue: value
        })
      );
    }
  };
  var ProductColumnBuilder = class _ProductColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _ProductColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new _ProductColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var SumColumnBuilder = class _SumColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _SumColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new _SumColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var SimpleSumColumnBuilder = class _SimpleSumColumnBuilder extends SumColumnBuilder {
    index(algorithm = "btree") {
      return new _SimpleSumColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    primaryKey() {
      return new _SimpleSumColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
  };
  var ScheduleAtColumnBuilder = class _ScheduleAtColumnBuilder extends ColumnBuilder {
    default(value) {
      return new _ScheduleAtColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new _ScheduleAtColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var IdentityColumnBuilder = class _IdentityColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _IdentityColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _IdentityColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _IdentityColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _IdentityColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new _IdentityColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var ConnectionIdColumnBuilder = class _ConnectionIdColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _ConnectionIdColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _ConnectionIdColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _ConnectionIdColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _ConnectionIdColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new _ConnectionIdColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var TimestampColumnBuilder = class _TimestampColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _TimestampColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _TimestampColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _TimestampColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _TimestampColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new _TimestampColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var TimeDurationColumnBuilder = class _TimeDurationColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _TimeDurationColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _TimeDurationColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _TimeDurationColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _TimeDurationColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
    name(name) {
      return new _TimeDurationColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { name })
      );
    }
  };
  var UuidColumnBuilder = class _UuidColumnBuilder extends ColumnBuilder {
    index(algorithm = "btree") {
      return new _UuidColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { indexType: algorithm })
      );
    }
    unique() {
      return new _UuidColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isUnique: true })
      );
    }
    primaryKey() {
      return new _UuidColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { isPrimaryKey: true })
      );
    }
    default(value) {
      return new _UuidColumnBuilder(
        this.typeBuilder,
        set(this.columnMetadata, { defaultValue: value })
      );
    }
  };
  var RefBuilder = class extends TypeBuilder {
    constructor(ref) {
      super(AlgebraicType.Ref(ref));
      __publicField(this, "ref");
      /** The phantom type of the pointee of this ref. */
      __publicField(this, "__spacetimeType");
      this.ref = ref;
    }
  };
  var enumImpl = (nameOrObj, maybeObj) => {
    let obj = nameOrObj;
    let name = void 0;
    if (typeof nameOrObj === "string") {
      if (!maybeObj) {
        throw new TypeError(
          "When providing a name, you must also provide the variants object or array."
        );
      }
      obj = maybeObj;
      name = nameOrObj;
    }
    if (Array.isArray(obj)) {
      const simpleVariantsObj = {};
      for (const variant of obj) {
        simpleVariantsObj[variant] = new UnitBuilder();
      }
      return new SimpleSumBuilderImpl(simpleVariantsObj, name);
    }
    return new SumBuilder(obj, name);
  };
  var t = {
    /**
     * Creates a new `Bool` {@link AlgebraicType} to be used in table definitions
     * Represented as `boolean` in TypeScript.
     * @returns A new {@link BoolBuilder} instance
     */
    bool: () => new BoolBuilder(),
    /**
     * Creates a new `String` {@link AlgebraicType} to be used in table definitions
     * Represented as `string` in TypeScript.
     * @returns A new {@link StringBuilder} instance
     */
    string: () => new StringBuilder(),
    /**
     * Creates a new `F64` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link F64Builder} instance
     */
    number: () => new F64Builder(),
    /**
     * Creates a new `I8` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link I8Builder} instance
     */
    i8: () => new I8Builder(),
    /**
     * Creates a new `U8` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link U8Builder} instance
     */
    u8: () => new U8Builder(),
    /**
     * Creates a new `I16` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link I16Builder} instance
     */
    i16: () => new I16Builder(),
    /**
     * Creates a new `U16` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link U16Builder} instance
     */
    u16: () => new U16Builder(),
    /**
     * Creates a new `I32` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link I32Builder} instance
     */
    i32: () => new I32Builder(),
    /**
     * Creates a new `U32` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link U32Builder} instance
     */
    u32: () => new U32Builder(),
    /**
     * Creates a new `I64` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link I64Builder} instance
     */
    i64: () => new I64Builder(),
    /**
     * Creates a new `U64` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link U64Builder} instance
     */
    u64: () => new U64Builder(),
    /**
     * Creates a new `I128` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link I128Builder} instance
     */
    i128: () => new I128Builder(),
    /**
     * Creates a new `U128` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link U128Builder} instance
     */
    u128: () => new U128Builder(),
    /**
     * Creates a new `I256` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link I256Builder} instance
     */
    i256: () => new I256Builder(),
    /**
     * Creates a new `U256` {@link AlgebraicType} to be used in table definitions
     * Represented as `bigint` in TypeScript.
     * @returns A new {@link U256Builder} instance
     */
    u256: () => new U256Builder(),
    /**
     * Creates a new `F32` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link F32Builder} instance
     */
    f32: () => new F32Builder(),
    /**
     * Creates a new `F64` {@link AlgebraicType} to be used in table definitions
     * Represented as `number` in TypeScript.
     * @returns A new {@link F64Builder} instance
     */
    f64: () => new F64Builder(),
    /**
     * Creates a new `Product` {@link AlgebraicType} to be used in table definitions. Product types in SpacetimeDB
     * are essentially the same as objects in JavaScript/TypeScript.
     * Properties of the object must also be {@link TypeBuilder}s.
     * Represented as an object with specific properties in TypeScript.
     *
     * @param name (optional) A display name for the product type. If omitted, an anonymous product type is created.
     * @param obj The object defining the properties of the type, whose property
     * values must be {@link TypeBuilder}s.
     * @returns A new {@link ProductBuilder} instance.
     */
    object: (nameOrObj, maybeObj) => {
      if (typeof nameOrObj === "string") {
        if (!maybeObj) {
          throw new TypeError(
            "When providing a name, you must also provide the object."
          );
        }
        return new ProductBuilder(maybeObj, nameOrObj);
      }
      return new ProductBuilder(nameOrObj, void 0);
    },
    /**
     * Creates a new `Row` {@link AlgebraicType} to be used in table definitions. Row types in SpacetimeDB
     * are similar to `Product` types, but are specifically used to define the schema of a table row.
     * Properties of the object must also be {@link TypeBuilder} or {@link ColumnBuilder}s.
     *
     * You can represent a `Row` as either a {@link RowObj} or an {@link RowBuilder} type when
     * defining a table schema.
     *
     * The {@link RowBuilder} type is useful when you want to create a type which can be used anywhere
     * a {@link TypeBuilder} is accepted, such as in nested objects or arrays, or as the argument
     * to a scheduled function.
     *
     * @param obj The object defining the properties of the row, whose property
     * values must be {@link TypeBuilder}s or {@link ColumnBuilder}s.
     * @returns A new {@link RowBuilder} instance
     */
    row: (nameOrObj, maybeObj) => {
      const [obj, name] = typeof nameOrObj === "string" ? [maybeObj, nameOrObj] : [nameOrObj, void 0];
      return new RowBuilder(obj, name);
    },
    /**
     * Creates a new `Array` {@link AlgebraicType} to be used in table definitions.
     * Represented as an array in TypeScript.
     * @param element The element type of the array, which must be a `TypeBuilder`.
     * @returns A new {@link ArrayBuilder} instance
     */
    array(e) {
      return new ArrayBuilder(e);
    },
    enum: enumImpl,
    /**
     * This is a special helper function for conveniently creating {@link Product} type columns with no fields.
     *
     * @returns A new {@link ProductBuilder} instance with no fields.
     */
    unit() {
      return new UnitBuilder();
    },
    /**
     * Creates a lazily-evaluated {@link TypeBuilder}. This is useful for creating
     * recursive types, such as a tree or linked list.
     * @param thunk A function that returns a {@link TypeBuilder}.
     * @returns A proxy {@link TypeBuilder} that evaluates the thunk on first access.
     */
    lazy(thunk) {
      let cached = null;
      const get = () => cached ?? (cached = thunk());
      const proxy = new Proxy({}, {
        get(_t, prop, recv) {
          const target = get();
          const val = Reflect.get(target, prop, recv);
          return typeof val === "function" ? val.bind(target) : val;
        },
        set(_t, prop, value, recv) {
          return Reflect.set(get(), prop, value, recv);
        },
        has(_t, prop) {
          return prop in get();
        },
        ownKeys() {
          return Reflect.ownKeys(get());
        },
        getOwnPropertyDescriptor(_t, prop) {
          return Object.getOwnPropertyDescriptor(get(), prop);
        },
        getPrototypeOf() {
          return Object.getPrototypeOf(get());
        }
      });
      return proxy;
    },
    /**
     * This is a special helper function for conveniently creating {@link ScheduleAt} type columns.
     * @returns A new ColumnBuilder instance with the {@link ScheduleAt} type.
     */
    scheduleAt: () => {
      return new ScheduleAtBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link Option} type.
     * You can create a column of the same type by constructing an enum with a `some` and `none` variant.
     * @param value The type of the value contained in the `some` variant of the `Option`.
     * @returns A new {@link OptionBuilder} instance with the {@link Option} type.
     */
    option(value) {
      return new OptionBuilder(value);
    },
    /**
     * This is a convenience method for creating a column with the {@link Result} type.
     * You can create a column of the same type by constructing an enum with an `ok` and `err` variant.
     * @param ok The type of the value contained in the `ok` variant of the `Result`.
     * @param err The type of the value contained in the `err` variant of the `Result`.
     * @returns A new {@link ResultBuilder} instance with the {@link Result} type.
     */
    result(ok, err) {
      return new ResultBuilder(ok, err);
    },
    /**
     * This is a convenience method for creating a column with the {@link Identity} type.
     * You can create a column of the same type by constructing an `object` with a single `__identity__` element.
     * @returns A new {@link TypeBuilder} instance with the {@link Identity} type.
     */
    identity: () => {
      return new IdentityBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link ConnectionId} type.
     * You can create a column of the same type by constructing an `object` with a single `__connection_id__` element.
     * @returns A new {@link TypeBuilder} instance with the {@link ConnectionId} type.
     */
    connectionId: () => {
      return new ConnectionIdBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link Timestamp} type.
     * You can create a column of the same type by constructing an `object` with a single `__timestamp_micros_since_unix_epoch__` element.
     * @returns A new {@link TypeBuilder} instance with the {@link Timestamp} type.
     */
    timestamp: () => {
      return new TimestampBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link TimeDuration} type.
     * You can create a column of the same type by constructing an `object` with a single `__time_duration_micros__` element.
     * @returns A new {@link TypeBuilder} instance with the {@link TimeDuration} type.
     */
    timeDuration: () => {
      return new TimeDurationBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link Uuid} type.
     * You can create a column of the same type by constructing an `object` with a single `__uuid__` element.
     * @returns A new {@link TypeBuilder} instance with the {@link Uuid} type.
     */
    uuid: () => {
      return new UuidBuilder();
    },
    /**
     * This is a convenience method for creating a column with the {@link ByteArray} type.
     * You can create a column of the same type by constructing an `array` of `u8`.
     * The TypeScript representation is {@link Uint8Array}.
     * @returns A new {@link ByteArrayBuilder} instance with the {@link ByteArray} type.
     */
    byteArray: () => {
      return new ByteArrayBuilder();
    }
  };
  var RowSizeHint = t.enum("RowSizeHint", {
    FixedSize: t.u16(),
    RowOffsets: t.array(t.u64())
  });
  var row_size_hint_type_default = RowSizeHint;
  var bsatn_row_list_type_default = t.object("BsatnRowList", {
    get sizeHint() {
      return row_size_hint_type_default;
    },
    rowsData: t.byteArray()
  });
  var call_reducer_type_default = t.object("CallReducer", {
    reducer: t.string(),
    args: t.byteArray(),
    requestId: t.u32(),
    flags: t.u8()
  });
  var subscribe_type_default = t.object("Subscribe", {
    queryStrings: t.array(t.string()),
    requestId: t.u32()
  });
  var one_off_query_type_default = t.object("OneOffQuery", {
    messageId: t.byteArray(),
    queryString: t.string()
  });
  var query_id_type_default = t.object("QueryId", {
    id: t.u32()
  });
  var subscribe_single_type_default = t.object("SubscribeSingle", {
    query: t.string(),
    requestId: t.u32(),
    get queryId() {
      return query_id_type_default;
    }
  });
  var subscribe_multi_type_default = t.object("SubscribeMulti", {
    queryStrings: t.array(t.string()),
    requestId: t.u32(),
    get queryId() {
      return query_id_type_default;
    }
  });
  var unsubscribe_type_default = t.object("Unsubscribe", {
    requestId: t.u32(),
    get queryId() {
      return query_id_type_default;
    }
  });
  var unsubscribe_multi_type_default = t.object("UnsubscribeMulti", {
    requestId: t.u32(),
    get queryId() {
      return query_id_type_default;
    }
  });
  var call_procedure_type_default = t.object("CallProcedure", {
    procedure: t.string(),
    args: t.byteArray(),
    requestId: t.u32(),
    flags: t.u8()
  });
  var ClientMessage = t.enum("ClientMessage", {
    get CallReducer() {
      return call_reducer_type_default;
    },
    get Subscribe() {
      return subscribe_type_default;
    },
    get OneOffQuery() {
      return one_off_query_type_default;
    },
    get SubscribeSingle() {
      return subscribe_single_type_default;
    },
    get SubscribeMulti() {
      return subscribe_multi_type_default;
    },
    get Unsubscribe() {
      return unsubscribe_type_default;
    },
    get UnsubscribeMulti() {
      return unsubscribe_multi_type_default;
    },
    get CallProcedure() {
      return call_procedure_type_default;
    }
  });
  var client_message_type_default = ClientMessage;
  var query_update_type_default = t.object("QueryUpdate", {
    get deletes() {
      return bsatn_row_list_type_default;
    },
    get inserts() {
      return bsatn_row_list_type_default;
    }
  });
  var CompressableQueryUpdate = t.enum("CompressableQueryUpdate", {
    get Uncompressed() {
      return query_update_type_default;
    },
    Brotli: t.byteArray(),
    Gzip: t.byteArray()
  });
  var compressable_query_update_type_default = CompressableQueryUpdate;
  var table_update_type_default = t.object("TableUpdate", {
    tableId: t.u32(),
    tableName: t.string(),
    numRows: t.u64(),
    get updates() {
      return t.array(compressable_query_update_type_default);
    }
  });
  var database_update_type_default = t.object("DatabaseUpdate", {
    get tables() {
      return t.array(table_update_type_default);
    }
  });
  var initial_subscription_type_default = t.object("InitialSubscription", {
    get databaseUpdate() {
      return database_update_type_default;
    },
    requestId: t.u32(),
    totalHostExecutionDuration: t.timeDuration()
  });
  var UpdateStatus = t.enum("UpdateStatus", {
    get Committed() {
      return database_update_type_default;
    },
    Failed: t.string(),
    OutOfEnergy: t.unit()
  });
  var update_status_type_default = UpdateStatus;
  var reducer_call_info_type_default = t.object("ReducerCallInfo", {
    reducerName: t.string(),
    reducerId: t.u32(),
    args: t.byteArray(),
    requestId: t.u32()
  });
  var energy_quanta_type_default = t.object("EnergyQuanta", {
    quanta: t.u128()
  });
  var transaction_update_type_default = t.object("TransactionUpdate", {
    get status() {
      return update_status_type_default;
    },
    timestamp: t.timestamp(),
    callerIdentity: t.identity(),
    callerConnectionId: t.connectionId(),
    get reducerCall() {
      return reducer_call_info_type_default;
    },
    get energyQuantaUsed() {
      return energy_quanta_type_default;
    },
    totalHostExecutionDuration: t.timeDuration()
  });
  var transaction_update_light_type_default = t.object("TransactionUpdateLight", {
    requestId: t.u32(),
    get update() {
      return database_update_type_default;
    }
  });
  var identity_token_type_default = t.object("IdentityToken", {
    identity: t.identity(),
    token: t.string(),
    connectionId: t.connectionId()
  });
  var one_off_table_type_default = t.object("OneOffTable", {
    tableName: t.string(),
    get rows() {
      return bsatn_row_list_type_default;
    }
  });
  var one_off_query_response_type_default = t.object("OneOffQueryResponse", {
    messageId: t.byteArray(),
    error: t.option(t.string()),
    get tables() {
      return t.array(one_off_table_type_default);
    },
    totalHostExecutionDuration: t.timeDuration()
  });
  var subscribe_rows_type_default = t.object("SubscribeRows", {
    tableId: t.u32(),
    tableName: t.string(),
    get tableRows() {
      return table_update_type_default;
    }
  });
  var subscribe_applied_type_default = t.object("SubscribeApplied", {
    requestId: t.u32(),
    totalHostExecutionDurationMicros: t.u64(),
    get queryId() {
      return query_id_type_default;
    },
    get rows() {
      return subscribe_rows_type_default;
    }
  });
  var unsubscribe_applied_type_default = t.object("UnsubscribeApplied", {
    requestId: t.u32(),
    totalHostExecutionDurationMicros: t.u64(),
    get queryId() {
      return query_id_type_default;
    },
    get rows() {
      return subscribe_rows_type_default;
    }
  });
  var subscription_error_type_default = t.object("SubscriptionError", {
    totalHostExecutionDurationMicros: t.u64(),
    requestId: t.option(t.u32()),
    queryId: t.option(t.u32()),
    tableId: t.option(t.u32()),
    error: t.string()
  });
  var subscribe_multi_applied_type_default = t.object("SubscribeMultiApplied", {
    requestId: t.u32(),
    totalHostExecutionDurationMicros: t.u64(),
    get queryId() {
      return query_id_type_default;
    },
    get update() {
      return database_update_type_default;
    }
  });
  var unsubscribe_multi_applied_type_default = t.object("UnsubscribeMultiApplied", {
    requestId: t.u32(),
    totalHostExecutionDurationMicros: t.u64(),
    get queryId() {
      return query_id_type_default;
    },
    get update() {
      return database_update_type_default;
    }
  });
  var ProcedureStatus = t.enum("ProcedureStatus", {
    Returned: t.byteArray(),
    OutOfEnergy: t.unit(),
    InternalError: t.string()
  });
  var procedure_status_type_default = ProcedureStatus;
  var procedure_result_type_default = t.object("ProcedureResult", {
    get status() {
      return procedure_status_type_default;
    },
    timestamp: t.timestamp(),
    totalHostExecutionDuration: t.timeDuration(),
    requestId: t.u32()
  });
  var ServerMessage = t.enum("ServerMessage", {
    get InitialSubscription() {
      return initial_subscription_type_default;
    },
    get TransactionUpdate() {
      return transaction_update_type_default;
    },
    get TransactionUpdateLight() {
      return transaction_update_light_type_default;
    },
    get IdentityToken() {
      return identity_token_type_default;
    },
    get OneOffQueryResponse() {
      return one_off_query_response_type_default;
    },
    get SubscribeApplied() {
      return subscribe_applied_type_default;
    },
    get UnsubscribeApplied() {
      return unsubscribe_applied_type_default;
    },
    get SubscriptionError() {
      return subscription_error_type_default;
    },
    get SubscribeMultiApplied() {
      return subscribe_multi_applied_type_default;
    },
    get UnsubscribeMultiApplied() {
      return unsubscribe_multi_applied_type_default;
    },
    get ProcedureResult() {
      return procedure_result_type_default;
    }
  });
  var server_message_type_default = ServerMessage;
  var _events, _a6;
  var EventEmitter = (_a6 = class {
    constructor() {
      __privateAdd(this, _events, /* @__PURE__ */ new Map());
    }
    on(event, callback) {
      let callbacks = __privateGet(this, _events).get(event);
      if (!callbacks) {
        callbacks = /* @__PURE__ */ new Set();
        __privateGet(this, _events).set(event, callbacks);
      }
      callbacks.add(callback);
    }
    off(event, callback) {
      const callbacks = __privateGet(this, _events).get(event);
      if (!callbacks) {
        return;
      }
      callbacks.delete(callback);
    }
    emit(event, ...args) {
      const callbacks = __privateGet(this, _events).get(event);
      if (!callbacks) {
        return;
      }
      for (const callback of callbacks) {
        callback(...args);
      }
    }
  }, _events = new WeakMap(), _a6);
  var LogLevelIdentifierIcon = {
    component: "\u{1F4E6}",
    info: "\u2139\uFE0F",
    warn: "\u26A0\uFE0F",
    error: "\u274C",
    debug: "\u{1F41B}"
  };
  var LogStyle = {
    component: "color: #fff; background-color: #8D6FDD; padding: 2px 5px; border-radius: 3px;",
    info: "color: #fff; background-color: #007bff; padding: 2px 5px; border-radius: 3px;",
    warn: "color: #fff; background-color: #ffc107; padding: 2px 5px; border-radius: 3px;",
    error: "color: #fff; background-color: #dc3545; padding: 2px 5px; border-radius: 3px;",
    debug: "color: #fff; background-color: #28a745; padding: 2px 5px; border-radius: 3px;"
  };
  var LogTextStyle = {
    component: "color: #8D6FDD;",
    info: "color: #007bff;",
    warn: "color: #ffc107;",
    error: "color: #dc3545;",
    debug: "color: #28a745;"
  };
  var stdbLogger = (level2, message) => {
    console.log(
      `%c${LogLevelIdentifierIcon[level2]} ${level2.toUpperCase()}%c ${message}`,
      LogStyle[level2],
      LogTextStyle[level2]
    );
  };
  var scalarCompare = (x, y) => {
    if (x === y)
      return 0;
    return x < y ? -1 : 1;
  };
  var _makeReadonlyIndex, makeReadonlyIndex_fn, _a7;
  var TableCacheImpl = (_a7 = class {
    /**
     * @param name the table name
     * @param primaryKeyCol column index designated as `#[primarykey]`
     * @param primaryKey column name designated as `#[primarykey]`
     * @param entityClass the entityClass
     */
    constructor(tableDef) {
      // TODO: this just scans the whole table; we should build proper index structures
      __privateAdd(this, _makeReadonlyIndex);
      __publicField(this, "rows");
      __publicField(this, "tableDef");
      __publicField(this, "emitter");
      __publicField(this, "applyOperations", (operations, ctx) => {
        const pendingCallbacks = [];
        const hasPrimaryKey = Object.values(this.tableDef.columns).some(
          (col) => col.columnMetadata.isPrimaryKey === true
        );
        if (hasPrimaryKey) {
          const insertMap = /* @__PURE__ */ new Map();
          const deleteMap = /* @__PURE__ */ new Map();
          for (const op of operations) {
            if (op.type === "insert") {
              const [_, prevCount] = insertMap.get(op.rowId) || [op, 0];
              insertMap.set(op.rowId, [op, prevCount + 1]);
            } else {
              const [_, prevCount] = deleteMap.get(op.rowId) || [op, 0];
              deleteMap.set(op.rowId, [op, prevCount + 1]);
            }
          }
          for (const [primaryKey, [insertOp, refCount]] of insertMap) {
            const deleteEntry = deleteMap.get(primaryKey);
            if (deleteEntry) {
              const [_, deleteCount] = deleteEntry;
              const refCountDelta = refCount - deleteCount;
              const maybeCb = this.update(
                ctx,
                primaryKey,
                insertOp.row,
                refCountDelta
              );
              if (maybeCb) {
                pendingCallbacks.push(maybeCb);
              }
              deleteMap.delete(primaryKey);
            } else {
              const maybeCb = this.insert(ctx, insertOp, refCount);
              if (maybeCb) {
                pendingCallbacks.push(maybeCb);
              }
            }
          }
          for (const [deleteOp, refCount] of deleteMap.values()) {
            const maybeCb = this.delete(ctx, deleteOp, refCount);
            if (maybeCb) {
              pendingCallbacks.push(maybeCb);
            }
          }
        } else {
          for (const op of operations) {
            if (op.type === "insert") {
              const maybeCb = this.insert(ctx, op);
              if (maybeCb) {
                pendingCallbacks.push(maybeCb);
              }
            } else {
              const maybeCb = this.delete(ctx, op);
              if (maybeCb) {
                pendingCallbacks.push(maybeCb);
              }
            }
          }
        }
        return pendingCallbacks;
      });
      __publicField(this, "update", (ctx, rowId, newRow, refCountDelta = 0) => {
        const existingEntry = this.rows.get(rowId);
        if (!existingEntry) {
          stdbLogger(
            "error",
            `Updating a row that was not present in the cache. Table: ${this.tableDef.name}, RowId: ${rowId}`
          );
          return void 0;
        }
        const [oldRow, previousCount] = existingEntry;
        const refCount = Math.max(1, previousCount + refCountDelta);
        if (previousCount + refCountDelta <= 0) {
          stdbLogger(
            "error",
            `Negative reference count for in table ${this.tableDef.name} row ${rowId} (${previousCount} + ${refCountDelta})`
          );
          return void 0;
        }
        this.rows.set(rowId, [newRow, refCount]);
        if (previousCount === 0) {
          stdbLogger(
            "error",
            `Updating a row id in table ${this.tableDef.name} which was not present in the cache (rowId: ${rowId})`
          );
          return {
            type: "insert",
            table: this.tableDef.name,
            cb: () => {
              this.emitter.emit("insert", ctx, newRow);
            }
          };
        }
        return {
          type: "update",
          table: this.tableDef.name,
          cb: () => {
            this.emitter.emit("update", ctx, oldRow, newRow);
          }
        };
      });
      __publicField(this, "insert", (ctx, operation, count = 1) => {
        const [_, previousCount] = this.rows.get(operation.rowId) || [
          operation.row,
          0
        ];
        this.rows.set(operation.rowId, [operation.row, previousCount + count]);
        if (previousCount === 0) {
          return {
            type: "insert",
            table: this.tableDef.name,
            cb: () => {
              this.emitter.emit("insert", ctx, operation.row);
            }
          };
        }
        return void 0;
      });
      __publicField(this, "delete", (ctx, operation, count = 1) => {
        const [_, previousCount] = this.rows.get(operation.rowId) || [
          operation.row,
          0
        ];
        if (previousCount === 0) {
          stdbLogger("warn", "Deleting a row that was not present in the cache");
          return void 0;
        }
        if (previousCount <= count) {
          this.rows.delete(operation.rowId);
          return {
            type: "delete",
            table: this.tableDef.name,
            cb: () => {
              this.emitter.emit("delete", ctx, operation.row);
            }
          };
        }
        this.rows.set(operation.rowId, [operation.row, previousCount - count]);
        return void 0;
      });
      /**
       * Register a callback for when a row is newly inserted into the database.
       *
       * ```ts
       * ctx.db.user.onInsert((reducerEvent, user) => {
       *   if (reducerEvent) {
       *      console.log("New user on reducer", reducerEvent, user);
       *   } else {
       *      console.log("New user received during subscription update on insert", user);
       *  }
       * });
       * ```
       *
       * @param cb Callback to be called when a new row is inserted
       */
      __publicField(this, "onInsert", (cb) => {
        this.emitter.on("insert", cb);
      });
      /**
       * Register a callback for when a row is deleted from the database.
       *
       * ```ts
       * ctx.db.user.onDelete((reducerEvent, user) => {
       *   if (reducerEvent) {
       *      console.log("Deleted user on reducer", reducerEvent, user);
       *   } else {
       *      console.log("Deleted user received during subscription update on update", user);
       *  }
       * });
       * ```
       *
       * @param cb Callback to be called when a new row is inserted
       */
      __publicField(this, "onDelete", (cb) => {
        this.emitter.on("delete", cb);
      });
      /**
       * Register a callback for when a row is updated into the database.
       *
       * ```ts
       * ctx.db.user.onInsert((reducerEvent, oldUser, user) => {
       *   if (reducerEvent) {
       *      console.log("Updated user on reducer", reducerEvent, user);
       *   } else {
       *      console.log("Updated user received during subscription update on delete", user);
       *  }
       * });
       * ```
       *
       * @param cb Callback to be called when a new row is inserted
       */
      __publicField(this, "onUpdate", (cb) => {
        this.emitter.on("update", cb);
      });
      /**
       * Remove a callback for when a row is newly inserted into the database.
       *
       * @param cb Callback to be removed
       */
      __publicField(this, "removeOnInsert", (cb) => {
        this.emitter.off("insert", cb);
      });
      /**
       * Remove a callback for when a row is deleted from the database.
       *
       * @param cb Callback to be removed
       */
      __publicField(this, "removeOnDelete", (cb) => {
        this.emitter.off("delete", cb);
      });
      /**
       * Remove a callback for when a row is updated into the database.
       *
       * @param cb Callback to be removed
       */
      __publicField(this, "removeOnUpdate", (cb) => {
        this.emitter.off("update", cb);
      });
      this.tableDef = tableDef;
      this.rows = /* @__PURE__ */ new Map();
      this.emitter = new EventEmitter();
      const indexesDef = this.tableDef.indexes || [];
      for (const idx of indexesDef) {
        const idxDef = idx;
        const index = __privateMethod(this, _makeReadonlyIndex, makeReadonlyIndex_fn).call(this, this.tableDef, idxDef);
        this[idx.name] = index;
      }
    }
    /**
     * @returns number of rows in the table
     */
    count() {
      return BigInt(this.rows.size);
    }
    /**
     * @returns The values of the rows in the table
     */
    iter() {
      function* generator(rows) {
        for (const [row] of rows.values()) {
          yield row;
        }
      }
      return generator(this.rows);
    }
    /**
     * Allows iteration over the rows in the table
     * @returns An iterator over the rows in the table
     */
    [Symbol.iterator]() {
      return this.iter();
    }
  }, _makeReadonlyIndex = new WeakSet(), makeReadonlyIndex_fn = function(tableDef, idx) {
    if (idx.algorithm !== "btree") {
      throw new Error("Only btree indexes are supported in TableCacheImpl");
    }
    const columns = idx.columns;
    const getKey = (row) => columns.map((c) => row[c]);
    const matchRange = (row, rangeArg) => {
      const key = getKey(row);
      const arr = Array.isArray(rangeArg) ? rangeArg : [rangeArg];
      const prefixLen = Math.max(0, arr.length - 1);
      for (let i = 0; i < prefixLen; i++) {
        if (!deepEqual(key[i], arr[i]))
          return false;
      }
      const lastProvided = arr[arr.length - 1];
      const kLast = key[prefixLen];
      if (lastProvided && typeof lastProvided === "object" && "from" in lastProvided && "to" in lastProvided) {
        const from = lastProvided.from;
        const to = lastProvided.to;
        if (from.tag !== "unbounded") {
          const c = scalarCompare(kLast, from.value);
          if (c < 0)
            return false;
          if (c === 0 && from.tag === "excluded")
            return false;
        }
        if (to.tag !== "unbounded") {
          const c = scalarCompare(kLast, to.value);
          if (c > 0)
            return false;
          if (c === 0 && to.tag === "excluded")
            return false;
        }
        return true;
      } else {
        if (!deepEqual(kLast, lastProvided))
          return false;
        return true;
      }
    };
    const isUnique = tableDef.constraints.some((constraint) => {
      if (constraint.constraint !== "unique") {
        return false;
      }
      return deepEqual(constraint.columns, idx.columns);
    });
    const self = this;
    if (isUnique) {
      const impl = {
        find: (colVal) => {
          const expected = Array.isArray(colVal) ? colVal : [colVal];
          for (const row of self.iter()) {
            if (deepEqual(getKey(row), expected))
              return row;
          }
          return null;
        }
      };
      return impl;
    } else {
      const impl = {
        *filter(range) {
          for (const row of self.iter()) {
            if (matchRange(row, range))
              yield row;
          }
        }
      };
      return impl;
    }
  }, _a7);
  var TableMap = class {
    constructor() {
      __publicField(this, "map", /* @__PURE__ */ new Map());
    }
    get(key) {
      return this.map.get(key);
    }
    set(key, value) {
      this.map.set(key, value);
      return this;
    }
    has(key) {
      return this.map.has(key);
    }
    delete(key) {
      return this.map.delete(key);
    }
    // optional: iteration stays broadly typed (cannot express per-key relation here)
    keys() {
      return this.map.keys();
    }
    values() {
      return this.map.values();
    }
    entries() {
      return this.map.entries();
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  };
  var ClientCache = class {
    constructor() {
      /**
       * The tables in the database.
       */
      __publicField(this, "tables", new TableMap());
    }
    /**
     * Returns the table with the given name.
     * - If SchemaDef is a concrete schema, `name` is constrained to known table names,
     *   and the return type matches that table.
     * - If SchemaDef is undefined, `name` is string and the return type is untyped.
     */
    getTable(name) {
      const table2 = this.tables.get(name);
      if (!table2) {
        console.error(
          "The table has not been registered for this client. Please register the table before using it. If you have registered global tables using the SpacetimeDBClient.registerTables() or `registerTable()` method, please make sure that is executed first!"
        );
        throw new Error(`Table ${String(name)} does not exist`);
      }
      return table2;
    }
    /**
     * Returns the table with the given name, creating it if needed.
     * - Typed mode: `tableTypeInfo.tableName` is constrained to known names and
     *   the return type matches that table.
     * - Untyped mode: accepts any string and returns an untyped TableCache.
     */
    getOrCreateTable(tableDef) {
      const name = tableDef.name;
      const table2 = this.tables.get(name);
      if (table2) {
        return table2;
      }
      const newTable = new TableCacheImpl(
        tableDef
      );
      this.tables.set(name, newTable);
      return newTable;
    }
  };
  function comparePreReleases(a, b) {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const aPart = a[i];
      const bPart = b[i];
      if (aPart === bPart)
        continue;
      if (typeof aPart === "number" && typeof bPart === "number") {
        return aPart - bPart;
      }
      if (typeof aPart === "string" && typeof bPart === "string") {
        return aPart.localeCompare(bPart);
      }
      return typeof aPart === "string" ? 1 : -1;
    }
    return a.length - b.length;
  }
  var SemanticVersion = class _SemanticVersion {
    constructor(major, minor, patch, preRelease = null, buildInfo = null) {
      __publicField(this, "major");
      __publicField(this, "minor");
      __publicField(this, "patch");
      __publicField(this, "preRelease");
      __publicField(this, "buildInfo");
      this.major = major;
      this.minor = minor;
      this.patch = patch;
      this.preRelease = preRelease;
      this.buildInfo = buildInfo;
    }
    toString() {
      let versionString = `${this.major}.${this.minor}.${this.patch}`;
      if (this.preRelease) {
        versionString += `-${this.preRelease.join(".")}`;
      }
      if (this.buildInfo) {
        versionString += `+${this.buildInfo}`;
      }
      return versionString;
    }
    compare(other) {
      if (this.major !== other.major) {
        return this.major - other.major;
      }
      if (this.minor !== other.minor) {
        return this.minor - other.minor;
      }
      if (this.patch !== other.patch) {
        return this.patch - other.patch;
      }
      if (this.preRelease && other.preRelease) {
        return comparePreReleases(this.preRelease, other.preRelease);
      }
      if (this.preRelease) {
        return -1;
      }
      if (other.preRelease) {
        return -1;
      }
      return 0;
    }
    clone() {
      return new _SemanticVersion(
        this.major,
        this.minor,
        this.patch,
        this.preRelease ? [...this.preRelease] : null,
        this.buildInfo
      );
    }
    static parseVersionString(version) {
      const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?(?:\+([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?$/;
      const match = version.match(regex);
      if (!match) {
        throw new Error(`Invalid version string: ${version}`);
      }
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      const patch = parseInt(match[3], 10);
      const preRelease = match[4] ? match[4].split(".").map((id) => isNaN(Number(id)) ? id : Number(id)) : null;
      const buildInfo = match[5] || null;
      return new _SemanticVersion(major, minor, patch, preRelease, buildInfo);
    }
  };
  var _MINIMUM_CLI_VERSION = new SemanticVersion(
    1,
    4,
    0
  );
  function ensureMinimumVersionOrThrow(versionString) {
    if (versionString === void 0) {
      throw new Error(versionErrorMessage(versionString));
    }
    const version = SemanticVersion.parseVersionString(versionString);
    if (version.compare(_MINIMUM_CLI_VERSION) < 0) {
      throw new Error(versionErrorMessage(versionString));
    }
  }
  function versionErrorMessage(incompatibleVersion) {
    return `Module code was generated with an incompatible version of the spacetimedb cli (${incompatibleVersion}). Update the cli version to at least ${_MINIMUM_CLI_VERSION.toString()} and regenerate the bindings. You can upgrade to the latest cli version by running: spacetime version upgrade`;
  }
  async function decompress(buffer, type, chunkSize = 128 * 1024) {
    let offset = 0;
    const readableStream = new ReadableStream({
      pull(controller) {
        if (offset < buffer.length) {
          const chunk = buffer.subarray(
            offset,
            Math.min(offset + chunkSize, buffer.length)
          );
          controller.enqueue(chunk);
          offset += chunkSize;
        } else {
          controller.close();
        }
      }
    });
    const decompressionStream = new DecompressionStream(type);
    const decompressedStream = readableStream.pipeThrough(decompressionStream);
    const reader = decompressedStream.getReader();
    const chunks = [];
    let totalLength = 0;
    let result;
    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
      totalLength += result.value.length;
    }
    const decompressedArray = new Uint8Array(totalLength);
    let chunkOffset = 0;
    for (const chunk of chunks) {
      decompressedArray.set(chunk, chunkOffset);
      chunkOffset += chunk.length;
    }
    return decompressedArray;
  }
  async function resolveWS() {
    if (typeof globalThis.WebSocket !== "undefined") {
      return globalThis.WebSocket;
    }
    const dynamicImport = new Function("m", "return import(m)");
    try {
      const { WebSocket: UndiciWS } = await dynamicImport("undici");
      return UndiciWS;
    } catch (err) {
      console.warn(
        "[spacetimedb-sdk] No global WebSocket found. On Node 18\u201321, please install `undici` (npm install undici) to enable WebSocket support."
      );
      throw err;
    }
  }
  var _ws, _handleOnMessage, handleOnMessage_fn, _handleOnOpen, handleOnOpen_fn, _handleOnError, handleOnError_fn, _handleOnClose, handleOnClose_fn, _a8;
  var WebsocketDecompressAdapter = (_a8 = class {
    constructor(ws) {
      __privateAdd(this, _handleOnMessage);
      __privateAdd(this, _handleOnOpen);
      __privateAdd(this, _handleOnError);
      __privateAdd(this, _handleOnClose);
      __publicField(this, "onclose");
      __publicField(this, "onopen");
      __publicField(this, "onmessage");
      __publicField(this, "onerror");
      __privateAdd(this, _ws, void 0);
      this.onmessage = void 0;
      this.onopen = void 0;
      this.onmessage = void 0;
      this.onerror = void 0;
      ws.onmessage = __privateMethod(this, _handleOnMessage, handleOnMessage_fn).bind(this);
      ws.onerror = __privateMethod(this, _handleOnError, handleOnError_fn).bind(this);
      ws.onclose = __privateMethod(this, _handleOnClose, handleOnClose_fn).bind(this);
      ws.onopen = __privateMethod(this, _handleOnOpen, handleOnOpen_fn).bind(this);
      ws.binaryType = "arraybuffer";
      __privateSet(this, _ws, ws);
    }
    send(msg) {
      __privateGet(this, _ws).send(msg);
    }
    close() {
      __privateGet(this, _ws).close();
    }
    static async createWebSocketFn({
      url,
      nameOrAddress,
      wsProtocol,
      authToken,
      compression,
      lightMode,
      confirmedReads
    }) {
      const headers = new Headers();
      const WS = await resolveWS();
      let temporaryAuthToken = void 0;
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
        const tokenUrl = new URL("v1/identity/websocket-token", url);
        tokenUrl.protocol = url.protocol === "wss:" ? "https:" : "http:";
        const response = await fetch(tokenUrl, { method: "POST", headers });
        if (response.ok) {
          const { token } = await response.json();
          temporaryAuthToken = token;
        } else {
          return Promise.reject(
            new Error(`Failed to verify token: ${response.statusText}`)
          );
        }
      }
      const databaseUrl = new URL(`v1/database/${nameOrAddress}/subscribe`, url);
      if (temporaryAuthToken) {
        databaseUrl.searchParams.set("token", temporaryAuthToken);
      }
      databaseUrl.searchParams.set(
        "compression",
        compression === "gzip" ? "Gzip" : "None"
      );
      if (lightMode) {
        databaseUrl.searchParams.set("light", "true");
      }
      if (confirmedReads !== void 0) {
        databaseUrl.searchParams.set("confirmed", confirmedReads.toString());
      }
      const ws = new WS(databaseUrl.toString(), wsProtocol);
      return new _a8(ws);
    }
  }, _ws = new WeakMap(), _handleOnMessage = new WeakSet(), handleOnMessage_fn = async function(msg) {
    const buffer = new Uint8Array(msg.data);
    let decompressed;
    if (buffer[0] === 0) {
      decompressed = buffer.slice(1);
    } else if (buffer[0] === 1) {
      throw new Error(
        "Brotli Compression not supported. Please use gzip or none compression in withCompression method on DbConnection."
      );
    } else if (buffer[0] === 2) {
      decompressed = await decompress(buffer.slice(1), "gzip");
    } else {
      throw new Error(
        "Unexpected Compression Algorithm. Please use `gzip` or `none`"
      );
    }
    this.onmessage?.({ data: decompressed });
  }, _handleOnOpen = new WeakSet(), handleOnOpen_fn = function(msg) {
    this.onopen?.(msg);
  }, _handleOnError = new WeakSet(), handleOnError_fn = function(msg) {
    this.onerror?.(msg);
  }, _handleOnClose = new WeakSet(), handleOnClose_fn = function(msg) {
    this.onclose?.(msg);
  }, _a8);
  var _uri, _nameOrAddress, _identity, _token, _emitter, _compression, _lightMode, _confirmedReads, _createWSFn, _a9;
  var DbConnectionBuilder = (_a9 = class {
    /**
     * Creates a new `DbConnectionBuilder` database client and set the initial parameters.
     *
     * Users are not expected to call this constructor directly. Instead, use the static method `DbConnection.builder()`.
     *
     * @param remoteModule The remote module to use to connect to the SpacetimeDB server.
     * @param dbConnectionConstructor The constructor to use to create a new `DbConnection`.
     */
    constructor(remoteModule, dbConnectionCtor) {
      __privateAdd(this, _uri, void 0);
      __privateAdd(this, _nameOrAddress, void 0);
      __privateAdd(this, _identity, void 0);
      __privateAdd(this, _token, void 0);
      __privateAdd(this, _emitter, new EventEmitter());
      __privateAdd(this, _compression, "gzip");
      __privateAdd(this, _lightMode, false);
      __privateAdd(this, _confirmedReads, void 0);
      __privateAdd(this, _createWSFn, void 0);
      this.remoteModule = remoteModule;
      this.dbConnectionCtor = dbConnectionCtor;
      __privateSet(this, _createWSFn, WebsocketDecompressAdapter.createWebSocketFn);
    }
    /**
     * Set the URI of the SpacetimeDB server to connect to.
     *
     * @param uri The URI of the SpacetimeDB server to connect to.
     *
     **/
    withUri(uri) {
      __privateSet(this, _uri, new URL(uri));
      return this;
    }
    /**
     * Set the name or Identity of the database module to connect to.
     *
     * @param nameOrAddress
     *
     * @returns The `DbConnectionBuilder` instance.
     */
    withModuleName(nameOrAddress) {
      __privateSet(this, _nameOrAddress, nameOrAddress);
      return this;
    }
    /**
     * Set the identity of the client to connect to the database.
     *
     * @param token The credentials to use to authenticate with SpacetimeDB. This
     * is optional. You can store the token returned by the `onConnect` callback
     * to use in future connections.
     *
     * @returns The `DbConnectionBuilder` instance.
     */
    withToken(token) {
      __privateSet(this, _token, token);
      return this;
    }
    withWSFn(createWSFn) {
      __privateSet(this, _createWSFn, createWSFn);
      return this;
    }
    /**
     * Set the compression algorithm to use for the connection.
     *
     * @param compression The compression algorithm to use for the connection.
     */
    withCompression(compression) {
      __privateSet(this, _compression, compression);
      return this;
    }
    /**
     * Sets the connection to operate in light mode.
     *
     * Light mode is a mode that reduces the amount of data sent over the network.
     *
     * @param lightMode The light mode for the connection.
     */
    withLightMode(lightMode) {
      __privateSet(this, _lightMode, lightMode);
      return this;
    }
    /**
     * Sets the connection to use confirmed reads.
     *
     * When enabled, the server will send query results only after they are
     * confirmed to be durable.
     *
     * What durable means depends on the server configuration: a single node
     * server may consider a transaction durable once it is `fsync`'ed to disk,
     * whereas a cluster may require that some number of replicas have
     * acknowledge that they have stored the transactions.
     *
     * Note that enabling confirmed reads will increase the latency between a
     * reducer call and the corresponding subscription update arriving at the
     * client.
     *
     * If this method is not called, not preference is sent to the server, and
     * the server will choose the default.
     *
     * @param confirmedReads `true` to enable confirmed reads, `false` to disable.
     */
    withConfirmedReads(confirmedReads) {
      __privateSet(this, _confirmedReads, confirmedReads);
      return this;
    }
    /**
     * Register a callback to be invoked upon authentication with the database.
     *
     * @param identity A unique identifier for a client connected to a database.
     * @param token The credentials to use to authenticate with SpacetimeDB.
     *
     * @returns The `DbConnectionBuilder` instance.
     *
     * The callback will be invoked with the `Identity` and private authentication `token` provided by the database to identify this connection.
     *
     * If credentials were supplied to connect, those passed to the callback will be equivalent to the ones used to connect.
     *
     * If the initial connection was anonymous, a new set of credentials will be generated by the database to identify this user.
     *
     * The credentials passed to the callback can be saved and used to authenticate the same user in future connections.
     *
     * @example
     *
     * ```ts
     * DbConnection.builder().onConnect((ctx, identity, token) => {
     *  console.log("Connected to SpacetimeDB with identity:", identity.toHexString());
     * });
     * ```
     */
    onConnect(callback) {
      __privateGet(this, _emitter).on("connect", callback);
      return this;
    }
    /**
     * Register a callback to be invoked upon an error.
     *
     * @example
     *
     * ```ts
     * DbConnection.builder().onConnectError((ctx, error) => {
     *   console.log("Error connecting to SpacetimeDB:", error);
     * });
     * ```
     */
    onConnectError(callback) {
      __privateGet(this, _emitter).on("connectError", callback);
      return this;
    }
    /**
     * Registers a callback to run when a {@link DbConnection} whose connection initially succeeded
     * is disconnected, either after a {@link DbConnection.disconnect} call or due to an error.
     *
     * If the connection ended because of an error, the error is passed to the callback.
     *
     * The `callback` will be installed on the `DbConnection` created by `build`
     * before initiating the connection, ensuring there's no opportunity for the disconnect to happen
     * before the callback is installed.
     *
     * Note that this does not trigger if `build` fails
     * or in cases where {@link DbConnectionBuilder.onConnectError} would trigger.
     * This callback only triggers if the connection closes after `build` returns successfully
     * and {@link DbConnectionBuilder.onConnect} is invoked, i.e., after the `IdentityToken` is received.
     *
     * To simplify SDK implementation, at most one such callback can be registered.
     * Calling `onDisconnect` on the same `DbConnectionBuilder` multiple times throws an error.
     *
     * Unlike callbacks registered via {@link DbConnection},
     * no mechanism is provided to unregister the provided callback.
     * This is a concession to ergonomics; there's no clean place to return a `CallbackId` from this method
     * or from `build`.
     *
     * @param {function(error?: Error): void} callback - The callback to invoke upon disconnection.
     * @throws {Error} Throws an error if called multiple times on the same `DbConnectionBuilder`.
     */
    onDisconnect(callback) {
      __privateGet(this, _emitter).on("disconnect", callback);
      return this;
    }
    /**
     * Builds a new `DbConnection` with the parameters set on this `DbConnectionBuilder` and attempts to connect to the SpacetimeDB server.
     *
     * @returns A new `DbConnection` with the parameters set on this `DbConnectionBuilder`.
     *
     * @example
     *
     * ```ts
     * const host = "http://localhost:3000";
     * const name_or_address = "database_name"
     * const auth_token = undefined;
     * DbConnection.builder().withUri(host).withModuleName(name_or_address).withToken(auth_token).build();
     * ```
     */
    build() {
      if (!__privateGet(this, _uri)) {
        throw new Error("URI is required to connect to SpacetimeDB");
      }
      if (!__privateGet(this, _nameOrAddress)) {
        throw new Error(
          "Database name or address is required to connect to SpacetimeDB"
        );
      }
      ensureMinimumVersionOrThrow(this.remoteModule.versionInfo?.cliVersion);
      return this.dbConnectionCtor({
        uri: __privateGet(this, _uri),
        nameOrAddress: __privateGet(this, _nameOrAddress),
        identity: __privateGet(this, _identity),
        token: __privateGet(this, _token),
        emitter: __privateGet(this, _emitter),
        compression: __privateGet(this, _compression),
        lightMode: __privateGet(this, _lightMode),
        confirmedReads: __privateGet(this, _confirmedReads),
        createWSFn: __privateGet(this, _createWSFn),
        remoteModule: this.remoteModule
      });
    }
  }, _uri = new WeakMap(), _nameOrAddress = new WeakMap(), _identity = new WeakMap(), _token = new WeakMap(), _emitter = new WeakMap(), _compression = new WeakMap(), _lightMode = new WeakMap(), _confirmedReads = new WeakMap(), _createWSFn = new WeakMap(), _a9);
  var _onApplied, _onError, _a10;
  var SubscriptionBuilderImpl = (_a10 = class {
    constructor(db) {
      __privateAdd(this, _onApplied, void 0);
      __privateAdd(this, _onError, void 0);
      this.db = db;
    }
    /**
     * Registers `callback` to run when this query is successfully added to our subscribed set,
     * I.e. when its `SubscriptionApplied` message is received.
     *
     * The database state exposed via the `&EventContext` argument
     * includes all the rows added to the client cache as a result of the new subscription.
     *
     * The event in the `&EventContext` argument is `Event::SubscribeApplied`.
     *
     * Multiple `on_applied` callbacks for the same query may coexist.
     * No mechanism for un-registering `on_applied` callbacks is exposed.
     *
     * @param cb - Callback to run when the subscription is applied.
     * @returns The current `SubscriptionBuilder` instance.
     */
    onApplied(cb) {
      __privateSet(this, _onApplied, cb);
      return this;
    }
    /**
     * Registers `callback` to run when this query either:
     * - Fails to be added to our subscribed set.
     * - Is unexpectedly removed from our subscribed set.
     *
     * If the subscription had previously started and has been unexpectedly removed,
     * the database state exposed via the `&EventContext` argument contains no rows
     * from any subscriptions removed within the same error event.
     * As proposed, it must therefore contain no rows.
     *
     * The event in the `&EventContext` argument is `Event::SubscribeError`,
     * containing a dynamic error object with a human-readable description of the error
     * for diagnostic purposes.
     *
     * Multiple `on_error` callbacks for the same query may coexist.
     * No mechanism for un-registering `on_error` callbacks is exposed.
     *
     * @param cb - Callback to run when there is an error in subscription.
     * @returns The current `SubscriptionBuilder` instance.
     */
    onError(cb) {
      __privateSet(this, _onError, cb);
      return this;
    }
    /**
     * Subscribe to a single query. The results of the query will be merged into the client
     * cache and deduplicated on the client.
     *
     * @param query_sql A `SQL` query to subscribe to.
     *
     * @example
     *
     * ```ts
     * const subscription = connection.subscriptionBuilder().onApplied(() => {
     *   console.log("SDK client cache initialized.");
     * }).subscribe("SELECT * FROM User");
     *
     * subscription.unsubscribe();
     * ```
     */
    subscribe(query_sql) {
      const queries = Array.isArray(query_sql) ? query_sql : [query_sql];
      if (queries.length === 0) {
        throw new Error("Subscriptions must have at least one query");
      }
      return new SubscriptionHandleImpl(
        this.db,
        queries,
        __privateGet(this, _onApplied),
        __privateGet(this, _onError)
      );
    }
    /**
     * Subscribes to all rows from all tables.
     *
     * This method is intended as a convenience
     * for applications where client-side memory use and network bandwidth are not concerns.
     * Applications where these resources are a constraint
     * should register more precise queries via `subscribe`
     * in order to replicate only the subset of data which the client needs to function.
     *
     * This method should not be combined with `subscribe` on the same `DbConnection`.
     * A connection may either `subscribe` to particular queries,
     * or `subscribeToAllTables`, but not both.
     * Attempting to call `subscribe`
     * on a `DbConnection` that has previously used `subscribeToAllTables`,
     * or vice versa, may misbehave in any number of ways,
     * including dropping subscriptions, corrupting the client cache, or throwing errors.
     */
    subscribeToAllTables() {
      this.subscribe("SELECT * FROM *");
    }
  }, _onApplied = new WeakMap(), _onError = new WeakMap(), _a10);
  var SubscriptionManager = class {
    constructor() {
      __publicField(this, "subscriptions", /* @__PURE__ */ new Map());
    }
  };
  var _queryId, _unsubscribeCalled, _endedState, _activeState, _emitter2, _a11;
  var SubscriptionHandleImpl = (_a11 = class {
    constructor(db, querySql, onApplied, onError) {
      __privateAdd(this, _queryId, void 0);
      __privateAdd(this, _unsubscribeCalled, false);
      __privateAdd(this, _endedState, false);
      __privateAdd(this, _activeState, false);
      __privateAdd(this, _emitter2, new EventEmitter());
      this.db = db;
      __privateGet(this, _emitter2).on(
        "applied",
        (ctx) => {
          __privateSet(this, _activeState, true);
          if (onApplied) {
            onApplied(ctx);
          }
        }
      );
      __privateGet(this, _emitter2).on(
        "error",
        (ctx, error) => {
          __privateSet(this, _activeState, false);
          __privateSet(this, _endedState, true);
          if (onError) {
            onError(ctx, error);
          }
        }
      );
      __privateSet(this, _queryId, this.db.registerSubscription(this, __privateGet(this, _emitter2), querySql));
    }
    /**
     * Consumes self and issues an `Unsubscribe` message,
     * removing this query from the client's set of subscribed queries.
     * It is only valid to call this method if `is_active()` is `true`.
     */
    unsubscribe() {
      if (__privateGet(this, _unsubscribeCalled)) {
        throw new Error("Unsubscribe has already been called");
      }
      __privateSet(this, _unsubscribeCalled, true);
      this.db.unregisterSubscription(__privateGet(this, _queryId));
      __privateGet(this, _emitter2).on(
        "end",
        (_ctx) => {
          __privateSet(this, _endedState, true);
          __privateSet(this, _activeState, false);
        }
      );
    }
    /**
     * Unsubscribes and also registers a callback to run upon success.
     * I.e. when an `UnsubscribeApplied` message is received.
     *
     * If `Unsubscribe` returns an error,
     * or if the `on_error` callback(s) are invoked before this subscription would end normally,
     * the `on_end` callback is not invoked.
     *
     * @param onEnd - Callback to run upon successful unsubscribe.
     */
    unsubscribeThen(onEnd) {
      if (__privateGet(this, _endedState)) {
        throw new Error("Subscription has already ended");
      }
      if (__privateGet(this, _unsubscribeCalled)) {
        throw new Error("Unsubscribe has already been called");
      }
      __privateSet(this, _unsubscribeCalled, true);
      this.db.unregisterSubscription(__privateGet(this, _queryId));
      __privateGet(this, _emitter2).on(
        "end",
        (ctx) => {
          __privateSet(this, _endedState, true);
          __privateSet(this, _activeState, false);
          onEnd(ctx);
        }
      );
    }
    /**
     * True if this `SubscriptionHandle` has ended,
     * either due to an error or a call to `unsubscribe`.
     *
     * This is initially false, and becomes true when either the `on_end` or `on_error` callback is invoked.
     * A subscription which has not yet been applied is not active, but is also not ended.
     */
    isEnded() {
      return __privateGet(this, _endedState);
    }
    /**
     * True if this `SubscriptionHandle` is active, meaning it has been successfully applied
     * and has not since ended, either due to an error or a complete `unsubscribe` request-response pair.
     *
     * This corresponds exactly to the interval bounded at the start by the `on_applied` callback
     * and at the end by either the `on_end` or `on_error` callback.
     */
    isActive() {
      return __privateGet(this, _activeState);
    }
  }, _queryId = new WeakMap(), _unsubscribeCalled = new WeakMap(), _endedState = new WeakMap(), _activeState = new WeakMap(), _emitter2 = new WeakMap(), _a11);
  function callReducerFlagsToNumber(flags) {
    switch (flags) {
      case "FullUpdate":
        return 0;
      case "NoSuccessNotify":
        return 1;
    }
  }
  var _queryId2, _requestId, _emitter3, _reducerEmitter, _onApplied2, _messageQueue, _subscriptionManager, _remoteModule, _callReducerFlags, _procedureCallbacks, _getNextQueryId, _getNextRequestId, _makeDbView, makeDbView_fn, _makeReducers, makeReducers_fn, _makeSetReducerFlags, makeSetReducerFlags_fn, _makeProcedures, makeProcedures_fn, _makeEventContext, makeEventContext_fn, _processParsedMessage, processParsedMessage_fn, _sendMessage, sendMessage_fn, _handleOnOpen2, handleOnOpen_fn2, _applyTableUpdates, applyTableUpdates_fn, _processMessage, processMessage_fn, _handleOnMessage2, handleOnMessage_fn2, _a12;
  var DbConnectionImpl = (_a12 = class {
    constructor({
      uri,
      nameOrAddress,
      identity,
      token,
      emitter,
      remoteModule,
      createWSFn,
      compression,
      lightMode,
      confirmedReads
    }) {
      __privateAdd(this, _makeDbView);
      __privateAdd(this, _makeReducers);
      __privateAdd(this, _makeSetReducerFlags);
      __privateAdd(this, _makeProcedures);
      __privateAdd(this, _makeEventContext);
      // This function is async because we decompress the message async
      __privateAdd(this, _processParsedMessage);
      __privateAdd(this, _sendMessage);
      /**
       * Handles WebSocket onOpen event.
       */
      __privateAdd(this, _handleOnOpen2);
      __privateAdd(this, _applyTableUpdates);
      __privateAdd(this, _processMessage);
      /**
       * Handles WebSocket onMessage event.
       * @param wsMessage MessageEvent object.
       */
      __privateAdd(this, _handleOnMessage2);
      /**
       * Whether or not the connection is active.
       */
      __publicField(this, "isActive", false);
      /**
       * This connection's public identity.
       */
      __publicField(this, "identity");
      /**
       * This connection's private authentication token.
       */
      __publicField(this, "token");
      /**
       * The accessor field to access the tables in the database and associated
       * callback functions.
       */
      __publicField(this, "db");
      /**
       * The accessor field to access the reducers in the database and associated
       * callback functions.
       */
      __publicField(this, "reducers");
      /**
       * The accessor field to access functions related to setting flags on
       * reducers regarding how the server should handle the reducer call and
       * the events that it sends back to the client.
       */
      __publicField(this, "setReducerFlags");
      /**
       * The accessor field to access the reducers in the database and associated
       * callback functions.
       */
      __publicField(this, "procedures");
      /**
       * The `ConnectionId` of the connection to to the database.
       */
      __publicField(this, "connectionId", ConnectionId.random());
      // These fields are meant to be strictly private.
      __privateAdd(this, _queryId2, 0);
      __privateAdd(this, _requestId, 0);
      __privateAdd(this, _emitter3, void 0);
      __privateAdd(this, _reducerEmitter, new EventEmitter());
      __privateAdd(this, _onApplied2, void 0);
      __privateAdd(this, _messageQueue, Promise.resolve());
      __privateAdd(this, _subscriptionManager, new SubscriptionManager());
      __privateAdd(this, _remoteModule, void 0);
      __privateAdd(this, _callReducerFlags, /* @__PURE__ */ new Map());
      __privateAdd(this, _procedureCallbacks, /* @__PURE__ */ new Map());
      // These fields are not part of the public API, but in a pinch you
      // could use JavaScript to access them by bypassing TypeScript's
      // private fields.
      // We use them in testing.
      __publicField(this, "clientCache");
      __publicField(this, "ws");
      __publicField(this, "wsPromise");
      __privateAdd(this, _getNextQueryId, () => {
        const queryId = __privateGet(this, _queryId2);
        __privateSet(this, _queryId2, __privateGet(this, _queryId2) + 1);
        return queryId;
      });
      __privateAdd(this, _getNextRequestId, () => __privateWrapper(this, _requestId)._++);
      // NOTE: This is very important!!! This is the actual function that
      // gets called when you call `connection.subscriptionBuilder()`.
      // The `subscriptionBuilder` function which is generated, just shadows
      // this function in the type system, but not the actual implementation!
      // Do not remove this function, or shoot yourself in the foot please.
      // It's not clear what would be a better way to do this at this exact
      // moment.
      __publicField(this, "subscriptionBuilder", () => {
        return new SubscriptionBuilderImpl(this);
      });
      stdbLogger("info", "Connecting to SpacetimeDB WS...");
      const url = new URL(uri.toString());
      if (!/^wss?:/.test(uri.protocol)) {
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      }
      this.identity = identity;
      this.token = token;
      __privateSet(this, _remoteModule, remoteModule);
      __privateSet(this, _emitter3, emitter);
      const connectionId = this.connectionId.toHexString();
      url.searchParams.set("connection_id", connectionId);
      this.clientCache = new ClientCache();
      this.db = __privateMethod(this, _makeDbView, makeDbView_fn).call(this, remoteModule);
      this.reducers = __privateMethod(this, _makeReducers, makeReducers_fn).call(this, remoteModule);
      this.setReducerFlags = __privateMethod(this, _makeSetReducerFlags, makeSetReducerFlags_fn).call(this, remoteModule);
      this.procedures = __privateMethod(this, _makeProcedures, makeProcedures_fn).call(this, remoteModule);
      this.wsPromise = createWSFn({
        url,
        nameOrAddress,
        wsProtocol: "v1.bsatn.spacetimedb",
        authToken: token,
        compression,
        lightMode,
        confirmedReads
      }).then((v) => {
        this.ws = v;
        this.ws.onclose = () => {
          __privateGet(this, _emitter3).emit("disconnect", this);
          this.isActive = false;
        };
        this.ws.onerror = (e) => {
          __privateGet(this, _emitter3).emit("connectError", this, e);
          this.isActive = false;
        };
        this.ws.onopen = __privateMethod(this, _handleOnOpen2, handleOnOpen_fn2).bind(this);
        this.ws.onmessage = __privateMethod(this, _handleOnMessage2, handleOnMessage_fn2).bind(this);
        return v;
      }).catch((e) => {
        stdbLogger("error", "Error connecting to SpacetimeDB WS");
        __privateGet(this, _emitter3).emit("connectError", this, e);
        return void 0;
      });
    }
    registerSubscription(handle, handleEmitter, querySql) {
      const queryId = __privateGet(this, _getNextQueryId).call(this);
      __privateGet(this, _subscriptionManager).subscriptions.set(queryId, {
        handle,
        emitter: handleEmitter
      });
      __privateMethod(this, _sendMessage, sendMessage_fn).call(this, client_message_type_default.SubscribeMulti({
        queryStrings: querySql,
        queryId: { id: queryId },
        // The TypeScript SDK doesn't currently track `request_id`s,
        // so always use 0.
        requestId: 0
      }));
      return queryId;
    }
    unregisterSubscription(queryId) {
      __privateMethod(this, _sendMessage, sendMessage_fn).call(this, client_message_type_default.UnsubscribeMulti({
        queryId: { id: queryId },
        // The TypeScript SDK doesn't currently track `request_id`s,
        // so always use 0.
        requestId: 0
      }));
    }
    /**
     * Call a reducer on your SpacetimeDB module.
     *
     * @param reducerName The name of the reducer to call
     * @param argsSerializer The arguments to pass to the reducer
     */
    callReducer(reducerName, argsBuffer, flags) {
      const message = client_message_type_default.CallReducer({
        reducer: reducerName,
        args: argsBuffer,
        // The TypeScript SDK doesn't currently track `request_id`s,
        // so always use 0.
        requestId: 0,
        flags: callReducerFlagsToNumber(flags)
      });
      __privateMethod(this, _sendMessage, sendMessage_fn).call(this, message);
    }
    /**
     * Call a reducer on your SpacetimeDB module with typed arguments.
     * @param reducerSchema The schema of the reducer to call
     * @param callReducerFlags The flags for the reducer call
     * @param params The arguments to pass to the reducer
     */
    callReducerWithParams(reducerName, paramsType, params, flags) {
      const writer = new BinaryWriter(1024);
      ProductType.serializeValue(writer, paramsType, params);
      const argsBuffer = writer.getBuffer();
      this.callReducer(reducerName, argsBuffer, flags);
    }
    /**
     * Call a reducer on your SpacetimeDB module.
     *
     * @param procedureName The name of the reducer to call
     * @param argsBuffer The arguments to pass to the reducer
     */
    callProcedure(procedureName, argsBuffer) {
      const { promise, resolve, reject } = Promise.withResolvers();
      const requestId = __privateGet(this, _getNextRequestId).call(this);
      const message = client_message_type_default.CallProcedure({
        procedure: procedureName,
        args: argsBuffer,
        requestId,
        // reserved for future use - 0 is the only valid value
        flags: 0
      });
      __privateMethod(this, _sendMessage, sendMessage_fn).call(this, message);
      __privateGet(this, _procedureCallbacks).set(requestId, (result) => {
        if (result.tag === "Ok") {
          resolve(result.value);
        } else {
          reject(result.value);
        }
      });
      return promise;
    }
    /**
     * Call a reducer on your SpacetimeDB module with typed arguments.
     * @param reducerSchema The schema of the reducer to call
     * @param callReducerFlags The flags for the reducer call
     * @param params The arguments to pass to the reducer
     */
    callProcedureWithParams(procedureName, paramsType, params, returnType) {
      const writer = new BinaryWriter(1024);
      ProductType.serializeValue(writer, paramsType, params);
      const argsBuffer = writer.getBuffer();
      return this.callProcedure(procedureName, argsBuffer).then((returnBuf) => {
        return AlgebraicType.deserializeValue(
          new BinaryReader(returnBuf),
          returnType
        );
      });
    }
    /**
     * Close the current connection.
     *
     * @example
     *
     * ```ts
     * const connection = DbConnection.builder().build();
     * connection.disconnect()
     * ```
     */
    disconnect() {
      this.wsPromise.then((wsResolved) => {
        if (wsResolved) {
          wsResolved.close();
        }
      });
    }
    on(eventName, callback) {
      __privateGet(this, _emitter3).on(eventName, callback);
    }
    off(eventName, callback) {
      __privateGet(this, _emitter3).off(eventName, callback);
    }
    onConnect(callback) {
      __privateGet(this, _emitter3).on("connect", callback);
    }
    onDisconnect(callback) {
      __privateGet(this, _emitter3).on("disconnect", callback);
    }
    onConnectError(callback) {
      __privateGet(this, _emitter3).on("connectError", callback);
    }
    removeOnConnect(callback) {
      __privateGet(this, _emitter3).off("connect", callback);
    }
    removeOnDisconnect(callback) {
      __privateGet(this, _emitter3).off("disconnect", callback);
    }
    removeOnConnectError(callback) {
      __privateGet(this, _emitter3).off("connectError", callback);
    }
    // Note: This is required to be public because it needs to be
    // called from the `RemoteReducers` class.
    onReducer(reducerName, callback) {
      __privateGet(this, _reducerEmitter).on(reducerName, callback);
    }
    // Note: This is required to be public because it needs to be
    // called from the `RemoteReducers` class.
    offReducer(reducerName, callback) {
      __privateGet(this, _reducerEmitter).off(reducerName, callback);
    }
  }, _queryId2 = new WeakMap(), _requestId = new WeakMap(), _emitter3 = new WeakMap(), _reducerEmitter = new WeakMap(), _onApplied2 = new WeakMap(), _messageQueue = new WeakMap(), _subscriptionManager = new WeakMap(), _remoteModule = new WeakMap(), _callReducerFlags = new WeakMap(), _procedureCallbacks = new WeakMap(), _getNextQueryId = new WeakMap(), _getNextRequestId = new WeakMap(), _makeDbView = new WeakSet(), makeDbView_fn = function(def) {
    const view = /* @__PURE__ */ Object.create(null);
    for (const tbl of def.tables) {
      const key = tbl.accessorName;
      Object.defineProperty(view, key, {
        enumerable: true,
        configurable: false,
        get: () => {
          return this.clientCache.getOrCreateTable(tbl);
        }
      });
    }
    return view;
  }, _makeReducers = new WeakSet(), makeReducers_fn = function(def) {
    const out = {};
    for (const reducer2 of def.reducers) {
      const key = toCamelCase(reducer2.name);
      out[key] = (params) => {
        const flags = __privateGet(this, _callReducerFlags).get(reducer2.name) ?? "FullUpdate";
        this.callReducerWithParams(
          reducer2.name,
          reducer2.paramsType,
          params,
          flags
        );
      };
      const onReducerEventKey = `on${toPascalCase(reducer2.name)}`;
      out[onReducerEventKey] = (callback) => {
        this.onReducer(reducer2.name, callback);
      };
      const offReducerEventKey = `removeOn${toPascalCase(reducer2.name)}`;
      out[offReducerEventKey] = (callback) => {
        this.offReducer(reducer2.name, callback);
      };
    }
    return out;
  }, _makeSetReducerFlags = new WeakSet(), makeSetReducerFlags_fn = function(defs) {
    const out = /* @__PURE__ */ Object.create(null);
    for (const r of defs.reducers) {
      const key = toCamelCase(r.name);
      Object.defineProperty(out, key, {
        enumerable: true,
        configurable: false,
        value: (flags) => {
          __privateGet(this, _callReducerFlags).set(r.name, flags);
        }
      });
    }
    return out;
  }, _makeProcedures = new WeakSet(), makeProcedures_fn = function(def) {
    const out = {};
    for (const procedure2 of def.procedures) {
      const key = toCamelCase(procedure2.name);
      const paramsType = new ProductBuilder(procedure2.params).algebraicType.value;
      const returnType = procedure2.returnType.algebraicType;
      out[key] = (params) => this.callProcedureWithParams(
        procedure2.name,
        paramsType,
        params,
        returnType
      );
    }
    return out;
  }, _makeEventContext = new WeakSet(), makeEventContext_fn = function(event) {
    return {
      db: this.db,
      reducers: this.reducers,
      setReducerFlags: this.setReducerFlags,
      isActive: this.isActive,
      subscriptionBuilder: this.subscriptionBuilder.bind(this),
      disconnect: this.disconnect.bind(this),
      event
    };
  }, _processParsedMessage = new WeakSet(), processParsedMessage_fn = async function(message) {
    const parseRowList = (type, tableName, rowList) => {
      const buffer = rowList.rowsData;
      const reader = new BinaryReader(buffer);
      const rows = [];
      const table2 = __privateGet(this, _remoteModule).tables.find((t2) => t2.name === tableName);
      const rowType = table2.rowType;
      const columnsArray = Object.entries(table2.columns);
      const primaryKeyColumnEntry = columnsArray.find(
        (col) => col[1].columnMetadata.isPrimaryKey
      );
      let previousOffset = 0;
      while (reader.remaining > 0) {
        const row = ProductType.deserializeValue(reader, rowType);
        let rowId = void 0;
        if (primaryKeyColumnEntry !== void 0) {
          const primaryKeyColName = primaryKeyColumnEntry[0];
          const primaryKeyColType = primaryKeyColumnEntry[1].typeBuilder.algebraicType;
          rowId = AlgebraicType.intoMapKey(
            primaryKeyColType,
            row[primaryKeyColName]
          );
        } else {
          const rowBytes = buffer.subarray(previousOffset, reader.offset);
          const asBase64 = (0, import_base64_js.fromByteArray)(rowBytes);
          rowId = asBase64;
        }
        previousOffset = reader.offset;
        rows.push({
          type,
          rowId,
          row
        });
      }
      return rows;
    };
    const parseTableUpdate = async (rawTableUpdate) => {
      const tableName = rawTableUpdate.tableName;
      let operations = [];
      for (const update of rawTableUpdate.updates) {
        let decompressed;
        if (update.tag === "Gzip") {
          const decompressedBuffer = await decompress(update.value, "gzip");
          decompressed = AlgebraicType.deserializeValue(
            new BinaryReader(decompressedBuffer),
            query_update_type_default.algebraicType
          );
        } else if (update.tag === "Brotli") {
          throw new Error(
            "Brotli compression not supported. Please use gzip or none compression in withCompression method on DbConnection."
          );
        } else {
          decompressed = update.value;
        }
        operations = operations.concat(
          parseRowList("insert", tableName, decompressed.inserts)
        );
        operations = operations.concat(
          parseRowList("delete", tableName, decompressed.deletes)
        );
      }
      return {
        tableName,
        operations
      };
    };
    const parseDatabaseUpdate = async (dbUpdate) => {
      const tableUpdates = [];
      for (const rawTableUpdate of dbUpdate.tables) {
        tableUpdates.push(await parseTableUpdate(rawTableUpdate));
      }
      return tableUpdates;
    };
    switch (message.tag) {
      case "InitialSubscription": {
        const dbUpdate = message.value.databaseUpdate;
        const tableUpdates = await parseDatabaseUpdate(dbUpdate);
        const subscriptionUpdate = {
          tag: "InitialSubscription",
          tableUpdates
        };
        return subscriptionUpdate;
      }
      case "TransactionUpdateLight": {
        const dbUpdate = message.value.update;
        const tableUpdates = await parseDatabaseUpdate(dbUpdate);
        const subscriptionUpdate = {
          tag: "TransactionUpdateLight",
          tableUpdates
        };
        return subscriptionUpdate;
      }
      case "TransactionUpdate": {
        const txUpdate = message.value;
        const identity = txUpdate.callerIdentity;
        const connectionId = ConnectionId.nullIfZero(
          txUpdate.callerConnectionId
        );
        const reducerName = txUpdate.reducerCall.reducerName;
        const args = txUpdate.reducerCall.args;
        const energyQuantaUsed = txUpdate.energyQuantaUsed;
        let tableUpdates = [];
        let errMessage = "";
        switch (txUpdate.status.tag) {
          case "Committed":
            tableUpdates = await parseDatabaseUpdate(txUpdate.status.value);
            break;
          case "Failed":
            tableUpdates = [];
            errMessage = txUpdate.status.value;
            break;
          case "OutOfEnergy":
            tableUpdates = [];
            break;
        }
        if (reducerName === "<none>") {
          const errorMessage = errMessage;
          console.error(`Received an error from the database: ${errorMessage}`);
          return;
        }
        let reducerInfo;
        if (reducerName !== "") {
          reducerInfo = {
            reducerName,
            args
          };
        }
        const transactionUpdate = {
          tag: "TransactionUpdate",
          tableUpdates,
          identity,
          connectionId,
          reducerInfo,
          status: txUpdate.status,
          energyConsumed: energyQuantaUsed.quanta,
          message: errMessage,
          timestamp: txUpdate.timestamp
        };
        return transactionUpdate;
      }
      case "IdentityToken": {
        const identityTokenMessage = {
          tag: "IdentityToken",
          identity: message.value.identity,
          token: message.value.token,
          connectionId: message.value.connectionId
        };
        return identityTokenMessage;
      }
      case "OneOffQueryResponse": {
        throw new Error(
          `TypeScript SDK never sends one-off queries, but got OneOffQueryResponse ${message}`
        );
      }
      case "SubscribeMultiApplied": {
        const parsedTableUpdates = await parseDatabaseUpdate(
          message.value.update
        );
        const subscribeAppliedMessage = {
          tag: "SubscribeApplied",
          queryId: message.value.queryId.id,
          tableUpdates: parsedTableUpdates
        };
        return subscribeAppliedMessage;
      }
      case "UnsubscribeMultiApplied": {
        const parsedTableUpdates = await parseDatabaseUpdate(
          message.value.update
        );
        const unsubscribeAppliedMessage = {
          tag: "UnsubscribeApplied",
          queryId: message.value.queryId.id,
          tableUpdates: parsedTableUpdates
        };
        return unsubscribeAppliedMessage;
      }
      case "SubscriptionError": {
        return {
          tag: "SubscriptionError",
          queryId: message.value.queryId,
          error: message.value.error
        };
      }
      case "ProcedureResult": {
        const { status, requestId } = message.value;
        return {
          tag: "ProcedureResult",
          requestId,
          result: status.tag === "Returned" ? { tag: "Ok", value: status.value } : status.tag === "OutOfEnergy" ? {
            tag: "Err",
            value: "Procedure execution aborted due to insufficient energy"
          } : { tag: "Err", value: status.value }
        };
      }
    }
  }, _sendMessage = new WeakSet(), sendMessage_fn = function(message) {
    this.wsPromise.then((wsResolved) => {
      if (wsResolved) {
        const writer = new BinaryWriter(1024);
        AlgebraicType.serializeValue(
          writer,
          client_message_type_default.algebraicType,
          message
        );
        const encoded = writer.getBuffer();
        wsResolved.send(encoded);
      }
    });
  }, _handleOnOpen2 = new WeakSet(), handleOnOpen_fn2 = function() {
    this.isActive = true;
  }, _applyTableUpdates = new WeakSet(), applyTableUpdates_fn = function(tableUpdates, eventContext) {
    const pendingCallbacks = [];
    for (const tableUpdate of tableUpdates) {
      const tableName = tableUpdate.tableName;
      const tableDef = __privateGet(this, _remoteModule).tables.find(
        (t2) => t2.name === tableName
      );
      const table2 = this.clientCache.getOrCreateTable(tableDef);
      const newCallbacks = table2.applyOperations(
        tableUpdate.operations,
        eventContext
      );
      for (const callback of newCallbacks) {
        pendingCallbacks.push(callback);
      }
    }
    return pendingCallbacks;
  }, _processMessage = new WeakSet(), processMessage_fn = async function(data) {
    var _a13;
    const serverMessage = AlgebraicType.deserializeValue(
      new BinaryReader(data),
      server_message_type_default.algebraicType
    );
    const message = await __privateMethod(this, _processParsedMessage, processParsedMessage_fn).call(this, serverMessage);
    if (!message) {
      return;
    }
    switch (message.tag) {
      case "InitialSubscription": {
        const event = { tag: "SubscribeApplied" };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const { event: _, ...subscriptionEventContext } = eventContext;
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        if (__privateGet(this, _emitter3)) {
          (_a13 = __privateGet(this, _onApplied2)) == null ? void 0 : _a13.call(this, subscriptionEventContext);
        }
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "TransactionUpdateLight": {
        const event = { tag: "UnknownTransaction" };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "TransactionUpdate": {
        let reducerInfo = message.reducerInfo;
        const reducer2 = reducerInfo === void 0 ? void 0 : __privateGet(this, _remoteModule).reducers.find(
          (t2) => t2.name === reducerInfo.reducerName
        );
        let reducerArgs = void 0;
        let unknownTransaction = reducer2 === void 0;
        if (reducer2) {
          try {
            const reader = new BinaryReader(reducerInfo.args);
            reducerArgs = ProductType.deserializeValue(
              reader,
              reducer2.paramsType
            );
          } catch {
            console.debug("Failed to deserialize reducer arguments");
            unknownTransaction = true;
          }
        }
        if (unknownTransaction) {
          const event2 = { tag: "UnknownTransaction" };
          const eventContext2 = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event2);
          const callbacks2 = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext2);
          for (const callback of callbacks2) {
            callback.cb();
          }
          return;
        }
        reducerInfo = reducerInfo;
        reducerArgs = reducerArgs;
        const reducerEvent = {
          callerIdentity: message.identity,
          status: message.status,
          callerConnectionId: message.connectionId,
          timestamp: message.timestamp,
          energyConsumed: message.energyConsumed,
          reducer: {
            name: reducerInfo.reducerName,
            args: reducerArgs
          }
        };
        const event = {
          tag: "Reducer",
          value: reducerEvent
        };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const reducerEventContext = {
          ...eventContext,
          event: reducerEvent
        };
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        __privateGet(this, _reducerEmitter).emit(
          reducerInfo.reducerName,
          reducerEventContext,
          reducerArgs
        );
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "IdentityToken": {
        this.identity = message.identity;
        if (!this.token && message.token) {
          this.token = message.token;
        }
        this.connectionId = message.connectionId;
        __privateGet(this, _emitter3).emit("connect", this, this.identity, this.token);
        break;
      }
      case "SubscribeApplied": {
        const subscription = __privateGet(this, _subscriptionManager).subscriptions.get(
          message.queryId
        );
        if (subscription === void 0) {
          stdbLogger(
            "error",
            `Received SubscribeApplied for unknown queryId ${message.queryId}.`
          );
          break;
        }
        const event = { tag: "SubscribeApplied" };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const { event: _, ...subscriptionEventContext } = eventContext;
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        subscription?.emitter.emit("applied", subscriptionEventContext);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "UnsubscribeApplied": {
        const subscription = __privateGet(this, _subscriptionManager).subscriptions.get(
          message.queryId
        );
        if (subscription === void 0) {
          stdbLogger(
            "error",
            `Received UnsubscribeApplied for unknown queryId ${message.queryId}.`
          );
          break;
        }
        const event = { tag: "UnsubscribeApplied" };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const { event: _, ...subscriptionEventContext } = eventContext;
        const callbacks = __privateMethod(this, _applyTableUpdates, applyTableUpdates_fn).call(this, message.tableUpdates, eventContext);
        subscription?.emitter.emit("end", subscriptionEventContext);
        __privateGet(this, _subscriptionManager).subscriptions.delete(message.queryId);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "SubscriptionError": {
        const error = Error(message.error);
        const event = { tag: "Error", value: error };
        const eventContext = __privateMethod(this, _makeEventContext, makeEventContext_fn).call(this, event);
        const errorContext = {
          ...eventContext,
          event: error
        };
        if (message.queryId !== void 0) {
          __privateGet(this, _subscriptionManager).subscriptions.get(message.queryId)?.emitter.emit("error", errorContext, error);
          __privateGet(this, _subscriptionManager).subscriptions.delete(message.queryId);
        } else {
          console.error("Received an error message without a queryId: ", error);
          __privateGet(this, _subscriptionManager).subscriptions.forEach(({ emitter }) => {
            emitter.emit("error", errorContext, error);
          });
        }
        break;
      }
      case "ProcedureResult": {
        const { requestId, result } = message;
        const cb = __privateGet(this, _procedureCallbacks).get(requestId);
        __privateGet(this, _procedureCallbacks).delete(requestId);
        cb?.(result);
        break;
      }
    }
  }, _handleOnMessage2 = new WeakSet(), handleOnMessage_fn2 = function(wsMessage) {
    __privateSet(this, _messageQueue, __privateGet(this, _messageQueue).then(() => {
      return __privateMethod(this, _processMessage, processMessage_fn).call(this, wsMessage.data);
    }));
  }, _a12);
  var Lifecycle = t.enum("Lifecycle", {
    Init: t.unit(),
    OnConnect: t.unit(),
    OnDisconnect: t.unit()
  });
  var lifecycle_type_default = Lifecycle;
  function pushReducer(name, params, fn, lifecycle) {
    if (existingReducers.has(name)) {
      throw new TypeError(`There is already a reducer with the name '${name}'`);
    }
    existingReducers.add(name);
    if (!(params instanceof RowBuilder)) {
      params = new RowBuilder(params);
    }
    if (params.typeName === void 0) {
      params.typeName = toPascalCase(name);
    }
    const ref = registerTypesRecursively(params);
    const paramsType = resolveType(MODULE_DEF.typespace, ref).value;
    MODULE_DEF.reducers.push({
      name,
      params: paramsType,
      lifecycle
      // <- lifecycle flag lands here
    });
    if (!fn.name) {
      Object.defineProperty(fn, "name", { value: name, writable: false });
    }
  }
  var existingReducers = /* @__PURE__ */ new Set();
  function reducer(name, params, fn) {
    pushReducer(name, params, fn);
  }
  function init(name, params, fn) {
    pushReducer(name, params, fn, lifecycle_type_default.Init);
  }
  function clientConnected(name, params, fn) {
    pushReducer(name, params, fn, lifecycle_type_default.OnConnect);
  }
  function clientDisconnected(name, params, fn) {
    pushReducer(name, params, fn, lifecycle_type_default.OnDisconnect);
  }
  var Reducers = class {
    constructor(handles) {
      __publicField(this, "reducersType");
      this.reducersType = reducersToSchema(handles);
    }
  };
  function reducersToSchema(reducers22) {
    const mapped = reducers22.map((r) => {
      const paramsRow = r.params.row;
      return {
        name: r.reducerName,
        // Prefer the schema's own accessorName if present at runtime; otherwise derive it.
        accessorName: r.accessorName,
        params: paramsRow,
        paramsType: r.paramsSpacetimeType
      };
    });
    const result = { reducers: mapped };
    return result;
  }
  function reducers(...args) {
    const handles = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    return new Reducers(handles);
  }
  function reducerSchema(name, params) {
    const paramType = {
      elements: Object.entries(params).map(([n, c]) => ({
        name: n,
        algebraicType: "typeBuilder" in c ? c.typeBuilder.algebraicType : c.algebraicType
      }))
    };
    return {
      reducerName: name,
      accessorName: toCamelCase(name),
      params: new RowBuilder(params),
      paramsSpacetimeType: paramType,
      reducerDef: {
        name,
        params: paramType,
        lifecycle: void 0
      }
    };
  }
  function defineView(opts, anon, params, ret, fn) {
    const paramsBuilder = new RowBuilder(params, toPascalCase(opts.name));
    let returnType = registerTypesRecursively(ret).algebraicType;
    const { value: paramType } = resolveType(
      MODULE_DEF.typespace,
      registerTypesRecursively(paramsBuilder)
    );
    MODULE_DEF.miscExports.push({
      tag: "View",
      value: {
        name: opts.name,
        index: (anon ? ANON_VIEWS : VIEWS).length,
        isPublic: opts.public,
        isAnonymous: anon,
        params: paramType,
        returnType
      }
    });
    if (returnType.tag == "Sum") {
      const originalFn = fn;
      fn = (ctx, args) => {
        const ret2 = originalFn(ctx, args);
        return ret2 == null ? [] : [ret2];
      };
      returnType = AlgebraicType.Array(
        returnType.value.variants[0].algebraicType
      );
    }
    (anon ? ANON_VIEWS : VIEWS).push({
      fn,
      params: paramType,
      returnType,
      returnTypeBaseSize: bsatnBaseSize(MODULE_DEF.typespace, returnType)
    });
  }
  var VIEWS = [];
  var ANON_VIEWS = [];
  function procedure(name, params, ret, fn) {
    const paramsType = {
      elements: Object.entries(params).map(([n, c]) => ({
        name: n,
        algebraicType: registerTypesRecursively(
          "typeBuilder" in c ? c.typeBuilder : c
        ).algebraicType
      }))
    };
    const returnType = registerTypesRecursively(ret).algebraicType;
    MODULE_DEF.miscExports.push({
      tag: "Procedure",
      value: {
        name,
        params: paramsType,
        returnType
      }
    });
    PROCEDURES.push({
      fn,
      paramsType,
      returnType,
      returnTypeBaseSize: bsatnBaseSize(MODULE_DEF.typespace, returnType)
    });
  }
  var PROCEDURES = [];
  function procedures(...args) {
    const procedures2 = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    return { procedures: procedures2 };
  }
  function tablesToSchema(tables2) {
    return { tables: tables2.map(tableToSchema) };
  }
  function tableToSchema(schema2) {
    const getColName = (i) => schema2.rowType.algebraicType.value.elements[i].name;
    return {
      name: schema2.tableName,
      accessorName: toCamelCase(schema2.tableName),
      columns: schema2.rowType.row,
      // typed as T[i]['rowType']['row'] under TablesToSchema<T>
      rowType: schema2.rowSpacetimeType,
      constraints: schema2.tableDef.constraints.map((c) => ({
        name: c.name,
        constraint: "unique",
        columns: c.data.value.columns.map(getColName)
      })),
      // TODO: horrible horrible horrible. we smuggle this `Array<UntypedIndex>`
      // by casting it to an `Array<IndexOpts>` as `TableToSchema` expects.
      // This is then used in `TableCacheImpl.constructor` and who knows where else.
      // We should stop lying about our types.
      indexes: schema2.tableDef.indexes.map((idx) => {
        const columnIds = idx.algorithm.tag === "Direct" ? [idx.algorithm.value] : idx.algorithm.value;
        return {
          name: idx.accessorName,
          unique: schema2.tableDef.constraints.some(
            (c) => c.data.value.columns.every((col) => columnIds.includes(col))
          ),
          algorithm: idx.algorithm.tag.toLowerCase(),
          columns: columnIds.map(getColName)
        };
      })
    };
  }
  var MODULE_DEF = {
    typespace: { types: [] },
    tables: [],
    reducers: [],
    types: [],
    miscExports: [],
    rowLevelSecurity: []
  };
  var COMPOUND_TYPES = /* @__PURE__ */ new Map();
  function resolveType(typespace, typeBuilder) {
    let ty = typeBuilder.algebraicType;
    while (ty.tag === "Ref") {
      ty = typespace.types[ty.value];
    }
    return ty;
  }
  function registerTypesRecursively(typeBuilder) {
    if (typeBuilder instanceof ProductBuilder && !isUnit(typeBuilder) || typeBuilder instanceof SumBuilder || typeBuilder instanceof RowBuilder) {
      return registerCompoundTypeRecursively(typeBuilder);
    } else if (typeBuilder instanceof OptionBuilder) {
      return new OptionBuilder(
        registerTypesRecursively(typeBuilder.value)
      );
    } else if (typeBuilder instanceof ResultBuilder) {
      return new ResultBuilder(
        registerTypesRecursively(typeBuilder.ok),
        registerTypesRecursively(typeBuilder.err)
      );
    } else if (typeBuilder instanceof ArrayBuilder) {
      return new ArrayBuilder(
        registerTypesRecursively(typeBuilder.element)
      );
    } else {
      return typeBuilder;
    }
  }
  function registerCompoundTypeRecursively(typeBuilder) {
    const ty = typeBuilder.algebraicType;
    const name = typeBuilder.typeName;
    if (name === void 0) {
      throw new Error(
        `Missing type name for ${typeBuilder.constructor.name ?? "TypeBuilder"} ${JSON.stringify(typeBuilder)}`
      );
    }
    let r = COMPOUND_TYPES.get(ty);
    if (r != null) {
      return r;
    }
    const newTy = typeBuilder instanceof RowBuilder || typeBuilder instanceof ProductBuilder ? {
      tag: "Product",
      value: { elements: [] }
    } : { tag: "Sum", value: { variants: [] } };
    r = new RefBuilder(MODULE_DEF.typespace.types.length);
    MODULE_DEF.typespace.types.push(newTy);
    COMPOUND_TYPES.set(ty, r);
    if (typeBuilder instanceof RowBuilder) {
      for (const [name2, elem] of Object.entries(typeBuilder.row)) {
        newTy.value.elements.push({
          name: name2,
          algebraicType: registerTypesRecursively(elem.typeBuilder).algebraicType
        });
      }
    } else if (typeBuilder instanceof ProductBuilder) {
      for (const [name2, elem] of Object.entries(typeBuilder.elements)) {
        newTy.value.elements.push({
          name: name2,
          algebraicType: registerTypesRecursively(elem).algebraicType
        });
      }
    } else if (typeBuilder instanceof SumBuilder) {
      for (const [name2, variant] of Object.entries(typeBuilder.variants)) {
        newTy.value.variants.push({
          name: name2,
          algebraicType: registerTypesRecursively(variant).algebraicType
        });
      }
    }
    MODULE_DEF.types.push({
      name: splitName(name),
      ty: r.ref,
      customOrdering: true
    });
    return r;
  }
  function isUnit(typeBuilder) {
    return typeBuilder.typeName == null && typeBuilder.algebraicType.value.elements.length === 0;
  }
  function splitName(name) {
    const scope = name.split(".");
    return { name: scope.pop(), scope };
  }
  var Schema = class {
    constructor(tables2, typespace, handles) {
      __publicField(this, "tablesDef");
      __publicField(this, "typespace");
      __publicField(this, "schemaType");
      __publicField(this, "clientVisibilityFilter", {
        sql(filter) {
          MODULE_DEF.rowLevelSecurity.push({ sql: filter });
        }
      });
      this.tablesDef = { tables: tables2 };
      this.typespace = typespace;
      this.schemaType = tablesToSchema(handles);
    }
    reducer(name, paramsOrFn, fn) {
      if (typeof paramsOrFn === "function") {
        reducer(name, {}, paramsOrFn);
        return paramsOrFn;
      } else {
        reducer(name, paramsOrFn, fn);
        return fn;
      }
    }
    init(nameOrFn, maybeFn) {
      const [name, fn] = typeof nameOrFn === "string" ? [nameOrFn, maybeFn] : ["init", nameOrFn];
      init(name, {}, fn);
    }
    clientConnected(nameOrFn, maybeFn) {
      const [name, fn] = typeof nameOrFn === "string" ? [nameOrFn, maybeFn] : ["on_connect", nameOrFn];
      clientConnected(name, {}, fn);
    }
    clientDisconnected(nameOrFn, maybeFn) {
      const [name, fn] = typeof nameOrFn === "string" ? [nameOrFn, maybeFn] : ["on_disconnect", nameOrFn];
      clientDisconnected(name, {}, fn);
    }
    view(opts, ret, fn) {
      defineView(opts, false, {}, ret, fn);
    }
    // TODO: re-enable once parameterized views are supported in SQL
    // view<Ret extends ViewReturnTypeBuilder>(
    //   opts: ViewOpts,
    //   ret: Ret,
    //   fn: ViewFn<S, {}, Ret>
    // ): void;
    // view<Params extends ParamsObj, Ret extends ViewReturnTypeBuilder>(
    //   opts: ViewOpts,
    //   params: Params,
    //   ret: Ret,
    //   fn: ViewFn<S, {}, Ret>
    // ): void;
    // view<Params extends ParamsObj, Ret extends ViewReturnTypeBuilder>(
    //   opts: ViewOpts,
    //   paramsOrRet: Ret | Params,
    //   retOrFn: ViewFn<S, {}, Ret> | Ret,
    //   maybeFn?: ViewFn<S, Params, Ret>
    // ): void {
    //   if (typeof retOrFn === 'function') {
    //     defineView(name, false, {}, paramsOrRet as Ret, retOrFn);
    //   } else {
    //     defineView(name, false, paramsOrRet as Params, retOrFn, maybeFn!);
    //   }
    // }
    anonymousView(opts, ret, fn) {
      defineView(opts, true, {}, ret, fn);
    }
    procedure(name, paramsOrRet, retOrFn, maybeFn) {
      if (typeof retOrFn === "function") {
        procedure(name, {}, paramsOrRet, retOrFn);
        return retOrFn;
      } else {
        procedure(name, paramsOrRet, retOrFn, maybeFn);
        return maybeFn;
      }
    }
  };
  function schema(...args) {
    const handles = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    const tableDefs = handles.map((h) => h.tableDef);
    MODULE_DEF.tables.push(...tableDefs);
    ({
      tables: handles.map((handle) => ({
        name: handle.tableName,
        accessorName: handle.tableName,
        columns: handle.rowType.row,
        rowType: handle.rowSpacetimeType,
        indexes: handle.idxs,
        constraints: handle.constraints
      }))
    });
    return new Schema(tableDefs, MODULE_DEF.typespace, handles);
  }
  function convertToAccessorMap(arr) {
    return Object.fromEntries(
      arr.map((v) => [v.accessorName, v])
    );
  }
  var RawIndexAlgorithm = t.enum("RawIndexAlgorithm", {
    BTree: t.array(t.u16()),
    Hash: t.array(t.u16()),
    Direct: t.u16()
  });
  var raw_index_algorithm_type_default = RawIndexAlgorithm;
  function table(opts, row) {
    const {
      name,
      public: isPublic = false,
      indexes: userIndexes = [],
      scheduled
    } = opts;
    const colIds = /* @__PURE__ */ new Map();
    const colNameList = [];
    if (!(row instanceof RowBuilder)) {
      row = new RowBuilder(row);
    }
    if (row.typeName === void 0) {
      row.typeName = toPascalCase(name);
    }
    const rowTypeRef = registerTypesRecursively(row);
    row.algebraicType.value.elements.forEach((elem, i) => {
      colIds.set(elem.name, i);
      colNameList.push(elem.name);
    });
    const pk = [];
    const indexes = [];
    const constraints = [];
    const sequences = [];
    let scheduleAtCol;
    for (const [name2, builder] of Object.entries(row.row)) {
      const meta = builder.columnMetadata;
      if (meta.isPrimaryKey) {
        pk.push(colIds.get(name2));
      }
      const isUnique = meta.isUnique || meta.isPrimaryKey;
      if (meta.indexType || isUnique) {
        const algo = meta.indexType ?? "btree";
        const id = colIds.get(name2);
        let algorithm;
        switch (algo) {
          case "btree":
            algorithm = raw_index_algorithm_type_default.BTree([id]);
            break;
          case "direct":
            algorithm = raw_index_algorithm_type_default.Direct(id);
            break;
        }
        indexes.push({
          name: void 0,
          // Unnamed indexes will be assigned a globally unique name
          accessorName: name2,
          // The name of this column will be used as the accessor name
          algorithm
        });
      }
      if (isUnique) {
        constraints.push({
          name: void 0,
          data: { tag: "Unique", value: { columns: [colIds.get(name2)] } }
        });
      }
      if (meta.isAutoIncrement) {
        sequences.push({
          name: void 0,
          start: void 0,
          minValue: void 0,
          maxValue: void 0,
          column: colIds.get(name2),
          increment: 1n
        });
      }
      if (scheduled) {
        const algebraicType = builder.typeBuilder.algebraicType;
        if (schedule_at_default.isScheduleAt(algebraicType)) {
          scheduleAtCol = colIds.get(name2);
        }
      }
    }
    for (const indexOpts of userIndexes ?? []) {
      let algorithm;
      switch (indexOpts.algorithm) {
        case "btree":
          algorithm = {
            tag: "BTree",
            value: indexOpts.columns.map((c) => colIds.get(c))
          };
          break;
        case "direct":
          algorithm = { tag: "Direct", value: colIds.get(indexOpts.column) };
          break;
      }
      indexes.push({ name: void 0, accessorName: indexOpts.name, algorithm });
    }
    for (const constraintOpts of opts.constraints ?? []) {
      if (constraintOpts.constraint === "unique") {
        const data = {
          tag: "Unique",
          value: { columns: constraintOpts.columns.map((c) => colIds.get(c)) }
        };
        constraints.push({ name: constraintOpts.name, data });
        continue;
      }
    }
    for (const index of indexes) {
      const cols = index.algorithm.tag === "Direct" ? [index.algorithm.value] : index.algorithm.value;
      const colS = cols.map((i) => colNameList[i]).join("_");
      index.name = `${name}_${colS}_idx_${index.algorithm.tag.toLowerCase()}`;
    }
    const tableDef = {
      name,
      productTypeRef: rowTypeRef.ref,
      primaryKey: pk,
      indexes,
      constraints,
      sequences,
      schedule: scheduled && scheduleAtCol !== void 0 ? {
        name: void 0,
        reducerName: scheduled,
        scheduledAtColumn: scheduleAtCol
      } : void 0,
      tableType: { tag: "User" },
      tableAccess: { tag: isPublic ? "Public" : "Private" }
    };
    const productType = row.algebraicType.value;
    return {
      rowType: row,
      tableName: name,
      rowSpacetimeType: productType,
      tableDef,
      idxs: {},
      constraints
    };
  }

  // spacetime-bindings/debug_get_player_quest_state_reducer.ts
  var debug_get_player_quest_state_reducer_default = {};

  // spacetime-bindings/dialogue_choice_reducer.ts
  var dialogue_choice_reducer_default = {
    eventId: t.u64(),
    optionId: t.u32()
  };

  // spacetime-bindings/move_player_reducer.ts
  var move_player_reducer_default = {
    dx: t.i32(),
    dy: t.i32()
  };

  // spacetime-bindings/move_to_reducer.ts
  var move_to_reducer_default = {
    destX: t.i32(),
    destY: t.i32()
  };

  // spacetime-bindings/request_interaction_reducer.ts
  var request_interaction_reducer_default = {
    tileX: t.i32(),
    tileY: t.i32()
  };

  // spacetime-bindings/request_zone_change_reducer.ts
  var request_zone_change_reducer_default = {
    toZoneId: t.i32(),
    spawnX: t.i32(),
    spawnY: t.i32()
  };

  // spacetime-bindings/seed_mon_data_reducer.ts
  var seed_mon_data_reducer_default = {};

  // spacetime-bindings/send_chat_message_reducer.ts
  var send_chat_message_reducer_default = {
    text: t.string()
  };

  // spacetime-bindings/set_display_name_reducer.ts
  var set_display_name_reducer_default = {
    newName: t.string()
  };

  // spacetime-bindings/tick_timer_type.ts
  var tick_timer_type_default = t.object("TickTimer", {
    scheduledId: t.u64(),
    scheduledAt: t.scheduleAt()
  });

  // spacetime-bindings/tick_loop_reducer.ts
  var tick_loop_reducer_default = {
    get timer() {
      return tick_timer_type_default;
    }
  };

  // spacetime-bindings/blocked_tile_table.ts
  var blocked_tile_table_default = t.row({
    key: t.u64().primaryKey(),
    zoneId: t.i32().name("zone_id"),
    x: t.i32(),
    y: t.i32()
  });

  // spacetime-bindings/chat_message_table.ts
  var chat_message_table_default = t.row({
    id: t.u64().primaryKey(),
    senderId: t.identity().name("sender_id"),
    senderName: t.string().name("sender_name"),
    text: t.string(),
    zoneId: t.i32().name("zone_id"),
    createdAt: t.timestamp().name("created_at")
  });

  // spacetime-bindings/flag_def_table.ts
  var flag_def_table_default = t.row({
    flagKey: t.string().primaryKey().name("flag_key"),
    flagType: t.string().name("flag_type"),
    scope: t.string(),
    category: t.string(),
    defaultValue: t.string().name("default_value"),
    description: t.string()
  });

  // spacetime-bindings/game_state_table.ts
  var game_state_table_default = t.row({
    singleton: t.u8().primaryKey(),
    currentTick: t.u64().name("current_tick")
  });

  // spacetime-bindings/interactable_definition_table.ts
  var interactable_definition_table_default = t.row({
    interactableDefId: t.u32().primaryKey().name("interactable_def_id"),
    interactableKey: t.string().name("interactable_key"),
    displayName: t.string().name("display_name"),
    spriteId: t.string().name("sprite_id"),
    behaviorId: t.u32().name("behavior_id"),
    defaultDialogueKey: t.string().name("default_dialogue_key")
  });

  // spacetime-bindings/interactable_spawn_table.ts
  var interactable_spawn_table_default = t.row({
    interactableSpawnId: t.u32().primaryKey().name("interactable_spawn_id"),
    interactableDefId: t.u32().name("interactable_def_id"),
    zoneId: t.i32().name("zone_id"),
    tileX: t.i32().name("tile_x"),
    tileY: t.i32().name("tile_y")
  });

  // spacetime-bindings/mon_ability_cooldown_table.ts
  var mon_ability_cooldown_table_default = t.row({
    playerId: t.i64().primaryKey().name("player_id"),
    globalAbilityCdExpiresAt: t.i64().name("global_ability_cd_expires_at"),
    lastMonInstanceId: t.option(t.i64()).name("last_mon_instance_id"),
    lastMonFormId: t.option(t.i32()).name("last_mon_form_id"),
    lastAbilityKey: t.option(t.string()).name("last_ability_key")
  });

  // spacetime-bindings/mon_evolution_rule_table.ts
  var mon_evolution_rule_table_default = t.row({
    evolutionRuleId: t.i32().primaryKey().name("evolution_rule_id"),
    fromMonFormId: t.i32().name("from_mon_form_id"),
    toMonFormId: t.i32().name("to_mon_form_id"),
    conditionKey: t.option(t.string()).name("condition_key"),
    requiredValue: t.option(t.i64()).name("required_value"),
    minLevel: t.option(t.i32()).name("min_level"),
    minBondRank: t.option(t.i32()).name("min_bond_rank")
  });

  // spacetime-bindings/element_type_type.ts
  var ElementType = t.enum("ElementType", {
    Wild: t.unit(),
    Civil: t.unit(),
    Spritual: t.unit(),
    Flame: t.unit(),
    Aqua: t.unit(),
    Plant: t.unit(),
    Metal: t.unit(),
    Earth: t.unit(),
    Storm: t.unit(),
    Frost: t.unit(),
    Toxic: t.unit(),
    Wind: t.unit(),
    Stone: t.unit()
  });
  var element_type_type_default = ElementType;

  // spacetime-bindings/mon_form_table.ts
  var mon_form_table_default = t.row({
    monFormId: t.i32().primaryKey().name("mon_form_id"),
    dexNumber: t.i32().name("dex_number"),
    code: t.string(),
    name: t.string(),
    baseHp: t.i32().name("base_hp"),
    baseSta: t.i32().name("base_sta"),
    baseAtk: t.i32().name("base_atk"),
    baseDef: t.i32().name("base_def"),
    baseInt: t.i32().name("base_int"),
    baseSpi: t.i32().name("base_spi"),
    get primaryElement() {
      return element_type_type_default.name("primary_element");
    },
    get secondaryElement() {
      return t.option(element_type_type_default).name("secondary_element");
    },
    passiveKey: t.string().name("passive_key"),
    activeAbilityKey: t.string().name("active_ability_key"),
    spriteKey: t.string().name("sprite_key"),
    budKey: t.string().name("bud_key"),
    familyTag: t.option(t.string()).name("family_tag"),
    isFinalEvolution: t.bool().name("is_final_evolution")
  });

  // spacetime-bindings/personality_type_type.ts
  var PersonalityType = t.enum("PersonalityType", {
    Brave: t.unit(),
    Calm: t.unit(),
    Eager: t.unit()
  });
  var personality_type_type_default = PersonalityType;

  // spacetime-bindings/mon_instance_table.ts
  var mon_instance_table_default = t.row({
    monInstanceId: t.i64().primaryKey().name("mon_instance_id"),
    ownerPlayerId: t.i64().name("owner_player_id"),
    monFormId: t.i32().name("mon_form_id"),
    level: t.i32(),
    experience: t.i64(),
    bondRank: t.i32().name("bond_rank"),
    bondExperience: t.i64().name("bond_experience"),
    get personality() {
      return personality_type_type_default;
    },
    talentSeed: t.i64().name("talent_seed"),
    talentHpMod: t.i32().name("talent_hp_mod"),
    talentStaMod: t.i32().name("talent_sta_mod"),
    talentAtkMod: t.i32().name("talent_atk_mod"),
    talentDefMod: t.i32().name("talent_def_mod"),
    talentIntMod: t.i32().name("talent_int_mod"),
    talentSpiMod: t.i32().name("talent_spi_mod"),
    fertilityRemaining: t.i32().name("fertility_remaining"),
    isInParty: t.bool().name("is_in_party"),
    partySlot: t.option(t.i32()).name("party_slot"),
    createdAt: t.i64().name("created_at"),
    lastUsedAt: t.i64().name("last_used_at")
  });

  // spacetime-bindings/move_queue_table.ts
  var move_queue_table_default = t.row({
    playerIdentity: t.identity().primaryKey().name("player_identity"),
    queue: t.string(),
    queueLength: t.i32().name("queue_length"),
    startTileX: t.i32().name("start_tile_x"),
    startTileY: t.i32().name("start_tile_y")
  });

  // spacetime-bindings/move_to_intent_table.ts
  var move_to_intent_table_default = t.row({
    playerIdentity: t.identity().primaryKey().name("player_identity"),
    zoneId: t.i32().name("zone_id"),
    destX: t.i32().name("dest_x"),
    destY: t.i32().name("dest_y"),
    seq: t.u64()
  });

  // spacetime-bindings/movement_intent_table.ts
  var movement_intent_table_default = t.row({
    intentId: t.u64().primaryKey().name("intent_id"),
    playerIdentity: t.identity().name("player_identity"),
    dx: t.i32(),
    dy: t.i32(),
    clientTick: t.u64().name("client_tick"),
    receivedAtTick: t.u64().name("received_at_tick")
  });

  // spacetime-bindings/npc_definition_table.ts
  var npc_definition_table_default = t.row({
    npcDefId: t.u32().primaryKey().name("npc_def_id"),
    npcKey: t.string().name("npc_key"),
    name: t.string(),
    spriteId: t.string().name("sprite_id"),
    behaviorId: t.u32().name("behavior_id"),
    defaultDialogueKey: t.string().name("default_dialogue_key")
  });

  // spacetime-bindings/npc_dialogue_action_table.ts
  var npc_dialogue_action_table_default = t.row({
    actionId: t.u64().primaryKey().name("action_id"),
    eventId: t.u64().name("event_id"),
    playerIdentity: t.identity().name("player_identity"),
    optionId: t.u32().name("option_id"),
    npcDefId: t.i32().name("npc_def_id"),
    actionKind: t.u8().name("action_kind"),
    questId: t.u32().name("quest_id"),
    stepIndex: t.u16().name("step_index")
  });

  // spacetime-bindings/npc_spawn_table.ts
  var npc_spawn_table_default = t.row({
    npcSpawnId: t.u32().primaryKey().name("npc_spawn_id"),
    npcDefId: t.u32().name("npc_def_id"),
    zoneId: t.i32().name("zone_id"),
    tileX: t.i32().name("tile_x"),
    tileY: t.i32().name("tile_y"),
    facing: t.u8()
  });

  // spacetime-bindings/player_table.ts
  var player_table_default = t.row({
    id: t.identity().primaryKey(),
    displayName: t.string().name("display_name")
  });

  // spacetime-bindings/dialogue_option_type.ts
  var dialogue_option_type_default = t.object("DialogueOption", {
    id: t.u32(),
    label: t.string()
  });

  // spacetime-bindings/player_dialogue_event_table.ts
  var player_dialogue_event_table_default = t.row({
    eventId: t.u64().primaryKey().name("event_id"),
    playerIdentity: t.identity().name("player_identity"),
    npcName: t.string().name("npc_name"),
    text: t.string(),
    get options() {
      return t.array(dialogue_option_type_default);
    }
  });

  // spacetime-bindings/player_flag_table.ts
  var player_flag_table_default = t.row({
    flagId: t.u64().primaryKey().name("flag_id"),
    playerId: t.identity().name("player_id"),
    key: t.string(),
    value: t.string()
  });

  // spacetime-bindings/player_mon_table.ts
  var player_mon_table_default = t.row({
    monId: t.u64().primaryKey().name("mon_id"),
    playerId: t.identity().name("player_id"),
    speciesId: t.u32().name("species_id"),
    nickname: t.string(),
    level: t.u8()
  });

  // spacetime-bindings/player_quest_table.ts
  var player_quest_table_default = t.row({
    questRowId: t.u64().primaryKey().name("quest_row_id"),
    playerId: t.identity().name("player_id"),
    questId: t.u32().name("quest_id"),
    state: t.u8(),
    step: t.u8()
  });

  // spacetime-bindings/player_state_table.ts
  var player_state_table_default = t.row({
    identity: t.identity().primaryKey(),
    tileX: t.i32().name("tile_x"),
    tileY: t.i32().name("tile_y"),
    facingX: t.i32().name("facing_x"),
    facingY: t.i32().name("facing_y"),
    zoneId: t.i32().name("zone_id"),
    lastMoveTick: t.u64().name("last_move_tick")
  });

  // spacetime-bindings/quest_debug_snapshot_table.ts
  var quest_debug_snapshot_table_default = t.row({
    playerIdentity: t.identity().primaryKey().name("player_identity"),
    jsonData: t.string().name("json_data")
  });

  // spacetime-bindings/quest_def_table.ts
  var quest_def_table_default = t.row({
    questId: t.u32().primaryKey().name("quest_id"),
    name: t.string(),
    summary: t.string(),
    startNpcKey: t.string().name("start_npc_key"),
    startNpcDefId: t.i32().name("start_npc_def_id"),
    isRepeatable: t.bool().name("is_repeatable")
  });

  // spacetime-bindings/quest_reward_def_table.ts
  var quest_reward_def_table_default = t.row({
    rowId: t.u64().primaryKey().name("row_id"),
    questId: t.u32().name("quest_id"),
    rewardIndex: t.u16().name("reward_index"),
    rewardType: t.string().name("reward_type"),
    value: t.string()
  });

  // spacetime-bindings/quest_step_def_table.ts
  var quest_step_def_table_default = t.row({
    rowId: t.u64().primaryKey().name("row_id"),
    questId: t.u32().name("quest_id"),
    stepIndex: t.u16().name("step_index"),
    stepType: t.string().name("step_type"),
    targetKey: t.string().name("target_key"),
    targetDefId: t.i32().name("target_def_id"),
    requiredCount: t.u32().name("required_count"),
    description: t.string(),
    choiceLabels: t.string().name("choice_labels"),
    onCompleteActions: t.string().name("on_complete_actions")
  });

  // spacetime-bindings/starter_mon_def_table.ts
  var starter_mon_def_table_default = t.row({
    starterId: t.u32().primaryKey().name("starter_id"),
    speciesId: t.u32().name("species_id"),
    displayName: t.string().name("display_name"),
    spriteId: t.string().name("sprite_id")
  });

  // spacetime-bindings/tick_timer_table.ts
  var tick_timer_table_default = t.row({
    scheduledId: t.u64().primaryKey().name("scheduled_id"),
    scheduledAt: t.scheduleAt().name("scheduled_at")
  });

  // spacetime-bindings/zone_collision_table.ts
  var zone_collision_table_default = t.row({
    zoneId: t.i32().primaryKey().name("zone_id"),
    ready: t.bool(),
    blockedCount: t.i32().name("blocked_count"),
    collisionVersion: t.string().name("collision_version")
  });

  // spacetime-bindings/zone_spawn_table.ts
  var zone_spawn_table_default = t.row({
    key: t.u64().primaryKey(),
    zoneId: t.i32().name("zone_id"),
    spawnId: t.string().name("spawn_id"),
    x: t.i32(),
    y: t.i32()
  });

  // spacetime-bindings/zone_transition_table.ts
  var zone_transition_table_default = t.row({
    key: t.u64().primaryKey(),
    zoneId: t.i32().name("zone_id"),
    x: t.i32(),
    y: t.i32(),
    targetZoneId: t.i32().name("target_zone_id"),
    targetSpawnId: t.string().name("target_spawn_id")
  });

  // spacetime-bindings/blocked_tile_type.ts
  var blocked_tile_type_default = t.object("BlockedTile", {
    key: t.u64(),
    zoneId: t.i32(),
    x: t.i32(),
    y: t.i32()
  });

  // spacetime-bindings/chat_message_type.ts
  var chat_message_type_default = t.object("ChatMessage", {
    id: t.u64(),
    senderId: t.identity(),
    senderName: t.string(),
    text: t.string(),
    zoneId: t.i32(),
    createdAt: t.timestamp()
  });

  // spacetime-bindings/flag_def_type.ts
  var flag_def_type_default = t.object("FlagDef", {
    flagKey: t.string(),
    flagType: t.string(),
    scope: t.string(),
    category: t.string(),
    defaultValue: t.string(),
    description: t.string()
  });

  // spacetime-bindings/game_state_type.ts
  var game_state_type_default = t.object("GameState", {
    singleton: t.u8(),
    currentTick: t.u64()
  });

  // spacetime-bindings/interactable_definition_type.ts
  var interactable_definition_type_default = t.object("InteractableDefinition", {
    interactableDefId: t.u32(),
    interactableKey: t.string(),
    displayName: t.string(),
    spriteId: t.string(),
    behaviorId: t.u32(),
    defaultDialogueKey: t.string()
  });

  // spacetime-bindings/interactable_spawn_type.ts
  var interactable_spawn_type_default = t.object("InteractableSpawn", {
    interactableSpawnId: t.u32(),
    interactableDefId: t.u32(),
    zoneId: t.i32(),
    tileX: t.i32(),
    tileY: t.i32()
  });

  // spacetime-bindings/mon_ability_cooldown_type.ts
  var mon_ability_cooldown_type_default = t.object("MonAbilityCooldown", {
    playerId: t.i64(),
    globalAbilityCdExpiresAt: t.i64(),
    lastMonInstanceId: t.option(t.i64()),
    lastMonFormId: t.option(t.i32()),
    lastAbilityKey: t.option(t.string())
  });

  // spacetime-bindings/mon_evolution_rule_type.ts
  var mon_evolution_rule_type_default = t.object("MonEvolutionRule", {
    evolutionRuleId: t.i32(),
    fromMonFormId: t.i32(),
    toMonFormId: t.i32(),
    conditionKey: t.option(t.string()),
    requiredValue: t.option(t.i64()),
    minLevel: t.option(t.i32()),
    minBondRank: t.option(t.i32())
  });

  // spacetime-bindings/mon_form_type.ts
  var mon_form_type_default = t.object("MonForm", {
    monFormId: t.i32(),
    dexNumber: t.i32(),
    code: t.string(),
    name: t.string(),
    baseHp: t.i32(),
    baseSta: t.i32(),
    baseAtk: t.i32(),
    baseDef: t.i32(),
    baseInt: t.i32(),
    baseSpi: t.i32(),
    get primaryElement() {
      return element_type_type_default;
    },
    get secondaryElement() {
      return t.option(element_type_type_default);
    },
    passiveKey: t.string(),
    activeAbilityKey: t.string(),
    spriteKey: t.string(),
    budKey: t.string(),
    familyTag: t.option(t.string()),
    isFinalEvolution: t.bool()
  });

  // spacetime-bindings/mon_instance_type.ts
  var mon_instance_type_default = t.object("MonInstance", {
    monInstanceId: t.i64(),
    ownerPlayerId: t.i64(),
    monFormId: t.i32(),
    level: t.i32(),
    experience: t.i64(),
    bondRank: t.i32(),
    bondExperience: t.i64(),
    get personality() {
      return personality_type_type_default;
    },
    talentSeed: t.i64(),
    talentHpMod: t.i32(),
    talentStaMod: t.i32(),
    talentAtkMod: t.i32(),
    talentDefMod: t.i32(),
    talentIntMod: t.i32(),
    talentSpiMod: t.i32(),
    fertilityRemaining: t.i32(),
    isInParty: t.bool(),
    partySlot: t.option(t.i32()),
    createdAt: t.i64(),
    lastUsedAt: t.i64()
  });

  // spacetime-bindings/move_queue_type.ts
  var move_queue_type_default = t.object("MoveQueue", {
    playerIdentity: t.identity(),
    queue: t.string(),
    queueLength: t.i32(),
    startTileX: t.i32(),
    startTileY: t.i32()
  });

  // spacetime-bindings/move_to_intent_type.ts
  var move_to_intent_type_default = t.object("MoveToIntent", {
    playerIdentity: t.identity(),
    zoneId: t.i32(),
    destX: t.i32(),
    destY: t.i32(),
    seq: t.u64()
  });

  // spacetime-bindings/movement_intent_type.ts
  var movement_intent_type_default = t.object("MovementIntent", {
    intentId: t.u64(),
    playerIdentity: t.identity(),
    dx: t.i32(),
    dy: t.i32(),
    clientTick: t.u64(),
    receivedAtTick: t.u64()
  });

  // spacetime-bindings/npc_definition_type.ts
  var npc_definition_type_default = t.object("NpcDefinition", {
    npcDefId: t.u32(),
    npcKey: t.string(),
    name: t.string(),
    spriteId: t.string(),
    behaviorId: t.u32(),
    defaultDialogueKey: t.string()
  });

  // spacetime-bindings/npc_dialogue_action_type.ts
  var npc_dialogue_action_type_default = t.object("NpcDialogueAction", {
    actionId: t.u64(),
    eventId: t.u64(),
    playerIdentity: t.identity(),
    optionId: t.u32(),
    npcDefId: t.i32(),
    actionKind: t.u8(),
    questId: t.u32(),
    stepIndex: t.u16()
  });

  // spacetime-bindings/npc_spawn_type.ts
  var npc_spawn_type_default = t.object("NpcSpawn", {
    npcSpawnId: t.u32(),
    npcDefId: t.u32(),
    zoneId: t.i32(),
    tileX: t.i32(),
    tileY: t.i32(),
    facing: t.u8()
  });

  // spacetime-bindings/player_type.ts
  var player_type_default = t.object("Player", {
    id: t.identity(),
    displayName: t.string()
  });

  // spacetime-bindings/player_dialogue_event_type.ts
  var player_dialogue_event_type_default = t.object("PlayerDialogueEvent", {
    eventId: t.u64(),
    playerIdentity: t.identity(),
    npcName: t.string(),
    text: t.string(),
    get options() {
      return t.array(dialogue_option_type_default);
    }
  });

  // spacetime-bindings/player_flag_type.ts
  var player_flag_type_default = t.object("PlayerFlag", {
    flagId: t.u64(),
    playerId: t.identity(),
    key: t.string(),
    value: t.string()
  });

  // spacetime-bindings/player_mon_type.ts
  var player_mon_type_default = t.object("PlayerMon", {
    monId: t.u64(),
    playerId: t.identity(),
    speciesId: t.u32(),
    nickname: t.string(),
    level: t.u8()
  });

  // spacetime-bindings/player_quest_type.ts
  var player_quest_type_default = t.object("PlayerQuest", {
    questRowId: t.u64(),
    playerId: t.identity(),
    questId: t.u32(),
    state: t.u8(),
    step: t.u8()
  });

  // spacetime-bindings/player_state_type.ts
  var player_state_type_default = t.object("PlayerState", {
    identity: t.identity(),
    tileX: t.i32(),
    tileY: t.i32(),
    facingX: t.i32(),
    facingY: t.i32(),
    zoneId: t.i32(),
    lastMoveTick: t.u64()
  });

  // spacetime-bindings/quest_debug_snapshot_type.ts
  var quest_debug_snapshot_type_default = t.object("QuestDebugSnapshot", {
    playerIdentity: t.identity(),
    jsonData: t.string()
  });

  // spacetime-bindings/quest_def_type.ts
  var quest_def_type_default = t.object("QuestDef", {
    questId: t.u32(),
    name: t.string(),
    summary: t.string(),
    startNpcKey: t.string(),
    startNpcDefId: t.i32(),
    isRepeatable: t.bool()
  });

  // spacetime-bindings/quest_reward_def_type.ts
  var quest_reward_def_type_default = t.object("QuestRewardDef", {
    rowId: t.u64(),
    questId: t.u32(),
    rewardIndex: t.u16(),
    rewardType: t.string(),
    value: t.string()
  });

  // spacetime-bindings/quest_step_def_type.ts
  var quest_step_def_type_default = t.object("QuestStepDef", {
    rowId: t.u64(),
    questId: t.u32(),
    stepIndex: t.u16(),
    stepType: t.string(),
    targetKey: t.string(),
    targetDefId: t.i32(),
    requiredCount: t.u32(),
    description: t.string(),
    choiceLabels: t.string(),
    onCompleteActions: t.string()
  });

  // spacetime-bindings/starter_mon_def_type.ts
  var starter_mon_def_type_default = t.object("StarterMonDef", {
    starterId: t.u32(),
    speciesId: t.u32(),
    displayName: t.string(),
    spriteId: t.string()
  });

  // spacetime-bindings/zone_collision_type.ts
  var zone_collision_type_default = t.object("ZoneCollision", {
    zoneId: t.i32(),
    ready: t.bool(),
    blockedCount: t.i32(),
    collisionVersion: t.string()
  });

  // spacetime-bindings/zone_spawn_type.ts
  var zone_spawn_type_default = t.object("ZoneSpawn", {
    key: t.u64(),
    zoneId: t.i32(),
    spawnId: t.string(),
    x: t.i32(),
    y: t.i32()
  });

  // spacetime-bindings/zone_transition_type.ts
  var zone_transition_type_default = t.object("ZoneTransition", {
    key: t.u64(),
    zoneId: t.i32(),
    x: t.i32(),
    y: t.i32(),
    targetZoneId: t.i32(),
    targetSpawnId: t.string()
  });

  // spacetime-bindings/index.ts
  var tablesSchema = schema(
    table({
      name: "blocked_tile",
      indexes: [
        { name: "key", algorithm: "btree", columns: [
          "key"
        ] }
      ],
      constraints: [
        { name: "blocked_tile_key_key", constraint: "unique", columns: ["key"] }
      ]
    }, blocked_tile_table_default),
    table({
      name: "chat_message",
      indexes: [
        { name: "id", algorithm: "btree", columns: [
          "id"
        ] }
      ],
      constraints: [
        { name: "chat_message_id_key", constraint: "unique", columns: ["id"] }
      ]
    }, chat_message_table_default),
    table({
      name: "flag_def",
      indexes: [
        { name: "flag_key", algorithm: "btree", columns: [
          "flagKey"
        ] }
      ],
      constraints: [
        { name: "flag_def_flag_key_key", constraint: "unique", columns: ["flagKey"] }
      ]
    }, flag_def_table_default),
    table({
      name: "game_state",
      indexes: [
        { name: "singleton", algorithm: "btree", columns: [
          "singleton"
        ] }
      ],
      constraints: [
        { name: "game_state_singleton_key", constraint: "unique", columns: ["singleton"] }
      ]
    }, game_state_table_default),
    table({
      name: "interactable_definition",
      indexes: [
        { name: "interactable_def_id", algorithm: "btree", columns: [
          "interactableDefId"
        ] }
      ],
      constraints: [
        { name: "interactable_definition_interactable_def_id_key", constraint: "unique", columns: ["interactableDefId"] }
      ]
    }, interactable_definition_table_default),
    table({
      name: "interactable_spawn",
      indexes: [
        { name: "interactable_spawn_id", algorithm: "btree", columns: [
          "interactableSpawnId"
        ] }
      ],
      constraints: [
        { name: "interactable_spawn_interactable_spawn_id_key", constraint: "unique", columns: ["interactableSpawnId"] }
      ]
    }, interactable_spawn_table_default),
    table({
      name: "mon_ability_cooldown",
      indexes: [
        { name: "player_id", algorithm: "btree", columns: [
          "playerId"
        ] }
      ],
      constraints: [
        { name: "mon_ability_cooldown_player_id_key", constraint: "unique", columns: ["playerId"] }
      ]
    }, mon_ability_cooldown_table_default),
    table({
      name: "mon_evolution_rule",
      indexes: [
        { name: "evolution_rule_id", algorithm: "btree", columns: [
          "evolutionRuleId"
        ] },
        { name: "from_mon_form_id", algorithm: "btree", columns: [
          "fromMonFormId"
        ] }
      ],
      constraints: [
        { name: "mon_evolution_rule_evolution_rule_id_key", constraint: "unique", columns: ["evolutionRuleId"] }
      ]
    }, mon_evolution_rule_table_default),
    table({
      name: "mon_form",
      indexes: [
        { name: "mon_form_id", algorithm: "btree", columns: [
          "monFormId"
        ] }
      ],
      constraints: [
        { name: "mon_form_mon_form_id_key", constraint: "unique", columns: ["monFormId"] }
      ]
    }, mon_form_table_default),
    table({
      name: "mon_instance",
      indexes: [
        { name: "mon_form_id", algorithm: "btree", columns: [
          "monFormId"
        ] },
        { name: "mon_instance_id", algorithm: "btree", columns: [
          "monInstanceId"
        ] },
        { name: "owner_player_id", algorithm: "btree", columns: [
          "ownerPlayerId"
        ] }
      ],
      constraints: [
        { name: "mon_instance_mon_instance_id_key", constraint: "unique", columns: ["monInstanceId"] }
      ]
    }, mon_instance_table_default),
    table({
      name: "move_queue",
      indexes: [
        { name: "player_identity", algorithm: "btree", columns: [
          "playerIdentity"
        ] }
      ],
      constraints: [
        { name: "move_queue_player_identity_key", constraint: "unique", columns: ["playerIdentity"] }
      ]
    }, move_queue_table_default),
    table({
      name: "move_to_intent",
      indexes: [
        { name: "player_identity", algorithm: "btree", columns: [
          "playerIdentity"
        ] }
      ],
      constraints: [
        { name: "move_to_intent_player_identity_key", constraint: "unique", columns: ["playerIdentity"] }
      ]
    }, move_to_intent_table_default),
    table({
      name: "movement_intent",
      indexes: [
        { name: "intent_id", algorithm: "btree", columns: [
          "intentId"
        ] }
      ],
      constraints: [
        { name: "movement_intent_intent_id_key", constraint: "unique", columns: ["intentId"] }
      ]
    }, movement_intent_table_default),
    table({
      name: "npc_definition",
      indexes: [
        { name: "npc_def_id", algorithm: "btree", columns: [
          "npcDefId"
        ] }
      ],
      constraints: [
        { name: "npc_definition_npc_def_id_key", constraint: "unique", columns: ["npcDefId"] }
      ]
    }, npc_definition_table_default),
    table({
      name: "npc_dialogue_action",
      indexes: [
        { name: "action_id", algorithm: "btree", columns: [
          "actionId"
        ] }
      ],
      constraints: [
        { name: "npc_dialogue_action_action_id_key", constraint: "unique", columns: ["actionId"] }
      ]
    }, npc_dialogue_action_table_default),
    table({
      name: "npc_spawn",
      indexes: [
        { name: "npc_spawn_id", algorithm: "btree", columns: [
          "npcSpawnId"
        ] }
      ],
      constraints: [
        { name: "npc_spawn_npc_spawn_id_key", constraint: "unique", columns: ["npcSpawnId"] }
      ]
    }, npc_spawn_table_default),
    table({
      name: "player",
      indexes: [
        { name: "id", algorithm: "btree", columns: [
          "id"
        ] }
      ],
      constraints: [
        { name: "player_id_key", constraint: "unique", columns: ["id"] }
      ]
    }, player_table_default),
    table({
      name: "player_dialogue_event",
      indexes: [
        { name: "event_id", algorithm: "btree", columns: [
          "eventId"
        ] }
      ],
      constraints: [
        { name: "player_dialogue_event_event_id_key", constraint: "unique", columns: ["eventId"] }
      ]
    }, player_dialogue_event_table_default),
    table({
      name: "player_flag",
      indexes: [
        { name: "flag_id", algorithm: "btree", columns: [
          "flagId"
        ] }
      ],
      constraints: [
        { name: "player_flag_flag_id_key", constraint: "unique", columns: ["flagId"] }
      ]
    }, player_flag_table_default),
    table({
      name: "player_mon",
      indexes: [
        { name: "mon_id", algorithm: "btree", columns: [
          "monId"
        ] }
      ],
      constraints: [
        { name: "player_mon_mon_id_key", constraint: "unique", columns: ["monId"] }
      ]
    }, player_mon_table_default),
    table({
      name: "player_quest",
      indexes: [
        { name: "quest_row_id", algorithm: "btree", columns: [
          "questRowId"
        ] }
      ],
      constraints: [
        { name: "player_quest_quest_row_id_key", constraint: "unique", columns: ["questRowId"] }
      ]
    }, player_quest_table_default),
    table({
      name: "player_state",
      indexes: [
        { name: "identity", algorithm: "btree", columns: [
          "identity"
        ] }
      ],
      constraints: [
        { name: "player_state_identity_key", constraint: "unique", columns: ["identity"] }
      ]
    }, player_state_table_default),
    table({
      name: "quest_debug_snapshot",
      indexes: [
        { name: "player_identity", algorithm: "btree", columns: [
          "playerIdentity"
        ] }
      ],
      constraints: [
        { name: "quest_debug_snapshot_player_identity_key", constraint: "unique", columns: ["playerIdentity"] }
      ]
    }, quest_debug_snapshot_table_default),
    table({
      name: "quest_def",
      indexes: [
        { name: "quest_id", algorithm: "btree", columns: [
          "questId"
        ] }
      ],
      constraints: [
        { name: "quest_def_quest_id_key", constraint: "unique", columns: ["questId"] }
      ]
    }, quest_def_table_default),
    table({
      name: "quest_reward_def",
      indexes: [
        { name: "row_id", algorithm: "btree", columns: [
          "rowId"
        ] }
      ],
      constraints: [
        { name: "quest_reward_def_row_id_key", constraint: "unique", columns: ["rowId"] }
      ]
    }, quest_reward_def_table_default),
    table({
      name: "quest_step_def",
      indexes: [
        { name: "row_id", algorithm: "btree", columns: [
          "rowId"
        ] }
      ],
      constraints: [
        { name: "quest_step_def_row_id_key", constraint: "unique", columns: ["rowId"] }
      ]
    }, quest_step_def_table_default),
    table({
      name: "starter_mon_def",
      indexes: [
        { name: "starter_id", algorithm: "btree", columns: [
          "starterId"
        ] }
      ],
      constraints: [
        { name: "starter_mon_def_starter_id_key", constraint: "unique", columns: ["starterId"] }
      ]
    }, starter_mon_def_table_default),
    table({
      name: "tick_timer",
      indexes: [
        { name: "scheduled_id", algorithm: "btree", columns: [
          "scheduledId"
        ] }
      ],
      constraints: [
        { name: "tick_timer_scheduled_id_key", constraint: "unique", columns: ["scheduledId"] }
      ]
    }, tick_timer_table_default),
    table({
      name: "zone_collision",
      indexes: [
        { name: "zone_id", algorithm: "btree", columns: [
          "zoneId"
        ] }
      ],
      constraints: [
        { name: "zone_collision_zone_id_key", constraint: "unique", columns: ["zoneId"] }
      ]
    }, zone_collision_table_default),
    table({
      name: "zone_spawn",
      indexes: [
        { name: "key", algorithm: "btree", columns: [
          "key"
        ] }
      ],
      constraints: [
        { name: "zone_spawn_key_key", constraint: "unique", columns: ["key"] }
      ]
    }, zone_spawn_table_default),
    table({
      name: "zone_transition",
      indexes: [
        { name: "key", algorithm: "btree", columns: [
          "key"
        ] }
      ],
      constraints: [
        { name: "zone_transition_key_key", constraint: "unique", columns: ["key"] }
      ]
    }, zone_transition_table_default)
  );
  var reducersSchema = reducers(
    reducerSchema("debug_get_player_quest_state", debug_get_player_quest_state_reducer_default),
    reducerSchema("dialogue_choice", dialogue_choice_reducer_default),
    reducerSchema("move_player", move_player_reducer_default),
    reducerSchema("move_to", move_to_reducer_default),
    reducerSchema("request_interaction", request_interaction_reducer_default),
    reducerSchema("request_zone_change", request_zone_change_reducer_default),
    reducerSchema("seed_mon_data", seed_mon_data_reducer_default),
    reducerSchema("send_chat_message", send_chat_message_reducer_default),
    reducerSchema("set_display_name", set_display_name_reducer_default),
    reducerSchema("tick_loop", tick_loop_reducer_default)
  );
  var proceduresSchema = procedures();
  var REMOTE_MODULE = {
    versionInfo: {
      cliVersion: "1.11.2"
    },
    tables: tablesSchema.schemaType.tables,
    reducers: reducersSchema.reducersType.reducers,
    ...proceduresSchema
  };
  var tables = convertToAccessorMap(tablesSchema.schemaType.tables);
  var reducers2 = convertToAccessorMap(reducersSchema.reducersType.reducers);
  var SubscriptionBuilder = class extends SubscriptionBuilderImpl {
  };
  var DbConnectionBuilder2 = class extends DbConnectionBuilder {
  };
  var _DbConnection = class _DbConnection extends DbConnectionImpl {
    constructor() {
      super(...arguments);
      /** Creates a new {@link SubscriptionBuilder} to configure a subscription to the remote SpacetimeDB instance. */
      __publicField(this, "subscriptionBuilder", () => {
        return new SubscriptionBuilder(this);
      });
    }
  };
  /** Creates a new {@link DbConnectionBuilder} to configure and connect to the remote SpacetimeDB instance. */
  __publicField(_DbConnection, "builder", () => {
    return new DbConnectionBuilder2(REMOTE_MODULE, (config) => new _DbConnection(config));
  });
  var DbConnection = _DbConnection;

  // node_modules/jwt-decode/build/esm/index.js
  var InvalidTokenError = class extends Error {
  };
  InvalidTokenError.prototype.name = "InvalidTokenError";
  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
      let code = p.charCodeAt(0).toString(16).toUpperCase();
      if (code.length < 2) {
        code = "0" + code;
      }
      return "%" + code;
    }));
  }
  function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw new Error("base64 string is not of the correct length");
    }
    try {
      return b64DecodeUnicode(output);
    } catch (err) {
      return atob(output);
    }
  }
  function jwtDecode(token, options) {
    if (typeof token !== "string") {
      throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    options || (options = {});
    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
      throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
    }
    let decoded;
    try {
      decoded = base64UrlDecode(part);
    } catch (e) {
      throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
    }
    try {
      return JSON.parse(decoded);
    } catch (e) {
      throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
    }
  }

  // node_modules/oidc-client-ts/dist/esm/oidc-client-ts.js
  var nopLogger = {
    debug: () => void 0,
    info: () => void 0,
    warn: () => void 0,
    error: () => void 0
  };
  var level;
  var logger;
  var Log = /* @__PURE__ */ ((Log2) => {
    Log2[Log2["NONE"] = 0] = "NONE";
    Log2[Log2["ERROR"] = 1] = "ERROR";
    Log2[Log2["WARN"] = 2] = "WARN";
    Log2[Log2["INFO"] = 3] = "INFO";
    Log2[Log2["DEBUG"] = 4] = "DEBUG";
    return Log2;
  })(Log || {});
  ((Log2) => {
    function reset() {
      level = 3;
      logger = nopLogger;
    }
    Log2.reset = reset;
    function setLevel(value) {
      if (!(0 <= value && value <= 4)) {
        throw new Error("Invalid log level");
      }
      level = value;
    }
    Log2.setLevel = setLevel;
    function setLogger(value) {
      logger = value;
    }
    Log2.setLogger = setLogger;
  })(Log || (Log = {}));
  var Logger = class _Logger {
    constructor(_name) {
      this._name = _name;
    }
    /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
    debug(...args) {
      if (level >= 4) {
        logger.debug(_Logger._format(this._name, this._method), ...args);
      }
    }
    info(...args) {
      if (level >= 3) {
        logger.info(_Logger._format(this._name, this._method), ...args);
      }
    }
    warn(...args) {
      if (level >= 2) {
        logger.warn(_Logger._format(this._name, this._method), ...args);
      }
    }
    error(...args) {
      if (level >= 1) {
        logger.error(_Logger._format(this._name, this._method), ...args);
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
    throw(err) {
      this.error(err);
      throw err;
    }
    create(method) {
      const methodLogger = Object.create(this);
      methodLogger._method = method;
      methodLogger.debug("begin");
      return methodLogger;
    }
    static createStatic(name, staticMethod) {
      const staticLogger = new _Logger(`${name}.${staticMethod}`);
      staticLogger.debug("begin");
      return staticLogger;
    }
    static _format(name, method) {
      const prefix = `[${name}]`;
      return method ? `${prefix} ${method}:` : prefix;
    }
    /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
    // helpers for static class methods
    static debug(name, ...args) {
      if (level >= 4) {
        logger.debug(_Logger._format(name), ...args);
      }
    }
    static info(name, ...args) {
      if (level >= 3) {
        logger.info(_Logger._format(name), ...args);
      }
    }
    static warn(name, ...args) {
      if (level >= 2) {
        logger.warn(_Logger._format(name), ...args);
      }
    }
    static error(name, ...args) {
      if (level >= 1) {
        logger.error(_Logger._format(name), ...args);
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
  };
  Log.reset();
  var JwtUtils = class {
    // IMPORTANT: doesn't validate the token
    static decode(token) {
      try {
        return jwtDecode(token);
      } catch (err) {
        Logger.error("JwtUtils.decode", err);
        throw err;
      }
    }
    static async generateSignedJwt(header, payload, privateKey) {
      const encodedHeader = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
      const encodedPayload = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
      const encodedToken = `${encodedHeader}.${encodedPayload}`;
      const signature = await window.crypto.subtle.sign(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" }
        },
        privateKey,
        new TextEncoder().encode(encodedToken)
      );
      const encodedSignature = CryptoUtils.encodeBase64Url(new Uint8Array(signature));
      return `${encodedToken}.${encodedSignature}`;
    }
    static async generateSignedJwtWithHmac(header, payload, secretKey) {
      const encodedHeader = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
      const encodedPayload = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
      const encodedToken = `${encodedHeader}.${encodedPayload}`;
      const signature = await window.crypto.subtle.sign(
        "HMAC",
        secretKey,
        new TextEncoder().encode(encodedToken)
      );
      const encodedSignature = CryptoUtils.encodeBase64Url(new Uint8Array(signature));
      return `${encodedToken}.${encodedSignature}`;
    }
  };
  var UUID_V4_TEMPLATE = "10000000-1000-4000-8000-100000000000";
  var toBase64 = (val) => btoa([...new Uint8Array(val)].map((chr) => String.fromCharCode(chr)).join(""));
  var _CryptoUtils = class _CryptoUtils2 {
    static _randomWord() {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0];
    }
    /**
     * Generates RFC4122 version 4 guid
     */
    static generateUUIDv4() {
      const uuid = UUID_V4_TEMPLATE.replace(
        /[018]/g,
        (c) => (+c ^ _CryptoUtils2._randomWord() & 15 >> +c / 4).toString(16)
      );
      return uuid.replace(/-/g, "");
    }
    /**
     * PKCE: Generate a code verifier
     */
    static generateCodeVerifier() {
      return _CryptoUtils2.generateUUIDv4() + _CryptoUtils2.generateUUIDv4() + _CryptoUtils2.generateUUIDv4();
    }
    /**
     * PKCE: Generate a code challenge
     */
    static async generateCodeChallenge(code_verifier) {
      if (!crypto.subtle) {
        throw new Error("Crypto.subtle is available only in secure contexts (HTTPS).");
      }
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(code_verifier);
        const hashed = await crypto.subtle.digest("SHA-256", data);
        return toBase64(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      } catch (err) {
        Logger.error("CryptoUtils.generateCodeChallenge", err);
        throw err;
      }
    }
    /**
     * Generates a base64-encoded string for a basic auth header
     */
    static generateBasicAuth(client_id, client_secret) {
      const encoder = new TextEncoder();
      const data = encoder.encode([client_id, client_secret].join(":"));
      return toBase64(data);
    }
    /**
     * Generates a hash of a string using a given algorithm
     * @param alg
     * @param message
     */
    static async hash(alg, message) {
      const msgUint8 = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest(alg, msgUint8);
      return new Uint8Array(hashBuffer);
    }
    /**
     * Generates a rfc7638 compliant jwk thumbprint
     * @param jwk
     */
    static async customCalculateJwkThumbprint(jwk) {
      let jsonObject;
      switch (jwk.kty) {
        case "RSA":
          jsonObject = {
            "e": jwk.e,
            "kty": jwk.kty,
            "n": jwk.n
          };
          break;
        case "EC":
          jsonObject = {
            "crv": jwk.crv,
            "kty": jwk.kty,
            "x": jwk.x,
            "y": jwk.y
          };
          break;
        case "OKP":
          jsonObject = {
            "crv": jwk.crv,
            "kty": jwk.kty,
            "x": jwk.x
          };
          break;
        case "oct":
          jsonObject = {
            "crv": jwk.k,
            "kty": jwk.kty
          };
          break;
        default:
          throw new Error("Unknown jwk type");
      }
      const utf8encodedAndHashed = await _CryptoUtils2.hash("SHA-256", JSON.stringify(jsonObject));
      return _CryptoUtils2.encodeBase64Url(utf8encodedAndHashed);
    }
    static async generateDPoPProof({
      url,
      accessToken,
      httpMethod,
      keyPair,
      nonce
    }) {
      let hashedToken;
      let encodedHash;
      const payload = {
        "jti": window.crypto.randomUUID(),
        "htm": httpMethod != null ? httpMethod : "GET",
        "htu": url,
        "iat": Math.floor(Date.now() / 1e3)
      };
      if (accessToken) {
        hashedToken = await _CryptoUtils2.hash("SHA-256", accessToken);
        encodedHash = _CryptoUtils2.encodeBase64Url(hashedToken);
        payload.ath = encodedHash;
      }
      if (nonce) {
        payload.nonce = nonce;
      }
      try {
        const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
        const header = {
          "alg": "ES256",
          "typ": "dpop+jwt",
          "jwk": {
            "crv": publicJwk.crv,
            "kty": publicJwk.kty,
            "x": publicJwk.x,
            "y": publicJwk.y
          }
        };
        return await JwtUtils.generateSignedJwt(header, payload, keyPair.privateKey);
      } catch (err) {
        if (err instanceof TypeError) {
          throw new Error(`Error exporting dpop public key: ${err.message}`);
        } else {
          throw err;
        }
      }
    }
    static async generateDPoPJkt(keyPair) {
      try {
        const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
        return await _CryptoUtils2.customCalculateJwkThumbprint(publicJwk);
      } catch (err) {
        if (err instanceof TypeError) {
          throw new Error(`Could not retrieve dpop keys from storage: ${err.message}`);
        } else {
          throw err;
        }
      }
    }
    static async generateDPoPKeys() {
      return await window.crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256"
        },
        false,
        ["sign", "verify"]
      );
    }
    /**
     * Generates a client assertion JWT for client_secret_jwt authentication
     * @param client_id The client identifier
     * @param client_secret The client secret
     * @param audience The token endpoint URL (audience)
     * @param algorithm The HMAC algorithm to use (HS256, HS384, HS512). Defaults to HS256
     */
    static async generateClientAssertionJwt(client_id, client_secret, audience, algorithm = "HS256") {
      const now = Math.floor(Date.now() / 1e3);
      const header = {
        "alg": algorithm,
        "typ": "JWT"
      };
      const payload = {
        "iss": client_id,
        "sub": client_id,
        "aud": audience,
        "jti": _CryptoUtils2.generateUUIDv4(),
        "exp": now + 300,
        // 5 minutes
        "iat": now
      };
      const hashMap = {
        "HS256": "SHA-256",
        "HS384": "SHA-384",
        "HS512": "SHA-512"
      };
      const hashFunction = hashMap[algorithm];
      if (!hashFunction) {
        throw new Error(`Unsupported algorithm: ${algorithm}. Supported algorithms are: HS256, HS384, HS512`);
      }
      const encoder = new TextEncoder();
      const secretKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(client_secret),
        { name: "HMAC", hash: hashFunction },
        false,
        ["sign"]
      );
      return await JwtUtils.generateSignedJwtWithHmac(header, payload, secretKey);
    }
  };
  _CryptoUtils.encodeBase64Url = (input) => {
    return toBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };
  var CryptoUtils = _CryptoUtils;
  var Event = class {
    constructor(_name) {
      this._name = _name;
      this._callbacks = [];
      this._logger = new Logger(`Event('${this._name}')`);
    }
    addHandler(cb) {
      this._callbacks.push(cb);
      return () => this.removeHandler(cb);
    }
    removeHandler(cb) {
      const idx = this._callbacks.lastIndexOf(cb);
      if (idx >= 0) {
        this._callbacks.splice(idx, 1);
      }
    }
    async raise(...ev) {
      this._logger.debug("raise:", ...ev);
      for (const cb of this._callbacks) {
        await cb(...ev);
      }
    }
  };
  var PopupUtils = class {
    /**
     * Populates a map of window features with a placement centered in front of
     * the current window. If no explicit width is given, a default value is
     * binned into [800, 720, 600, 480, 360] based on the current window's width.
     */
    static center({ ...features }) {
      var _a13, _b, _c;
      if (features.width == null)
        features.width = (_a13 = [800, 720, 600, 480].find((width) => width <= window.outerWidth / 1.618)) != null ? _a13 : 360;
      (_b = features.left) != null ? _b : features.left = Math.max(0, Math.round(window.screenX + (window.outerWidth - features.width) / 2));
      if (features.height != null)
        (_c = features.top) != null ? _c : features.top = Math.max(0, Math.round(window.screenY + (window.outerHeight - features.height) / 2));
      return features;
    }
    static serialize(features) {
      return Object.entries(features).filter(([, value]) => value != null).map(([key, value]) => `${key}=${typeof value !== "boolean" ? value : value ? "yes" : "no"}`).join(",");
    }
  };
  var Timer = class _Timer extends Event {
    constructor() {
      super(...arguments);
      this._logger = new Logger(`Timer('${this._name}')`);
      this._timerHandle = null;
      this._expiration = 0;
      this._callback = () => {
        const diff = this._expiration - _Timer.getEpochTime();
        this._logger.debug("timer completes in", diff);
        if (this._expiration <= _Timer.getEpochTime()) {
          this.cancel();
          void super.raise();
        }
      };
    }
    // get the time
    static getEpochTime() {
      return Math.floor(Date.now() / 1e3);
    }
    init(durationInSeconds) {
      const logger2 = this._logger.create("init");
      durationInSeconds = Math.max(Math.floor(durationInSeconds), 1);
      const expiration = _Timer.getEpochTime() + durationInSeconds;
      if (this.expiration === expiration && this._timerHandle) {
        logger2.debug("skipping since already initialized for expiration at", this.expiration);
        return;
      }
      this.cancel();
      logger2.debug("using duration", durationInSeconds);
      this._expiration = expiration;
      const timerDurationInSeconds = Math.min(durationInSeconds, 5);
      this._timerHandle = setInterval(this._callback, timerDurationInSeconds * 1e3);
    }
    get expiration() {
      return this._expiration;
    }
    cancel() {
      this._logger.create("cancel");
      if (this._timerHandle) {
        clearInterval(this._timerHandle);
        this._timerHandle = null;
      }
    }
  };
  var UrlUtils = class {
    static readParams(url, responseMode = "query") {
      if (!url)
        throw new TypeError("Invalid URL");
      const parsedUrl = new URL(url, "http://127.0.0.1");
      const params = parsedUrl[responseMode === "fragment" ? "hash" : "search"];
      return new URLSearchParams(params.slice(1));
    }
  };
  var URL_STATE_DELIMITER = ";";
  var ErrorResponse = class extends Error {
    constructor(args, form) {
      var _a13, _b, _c;
      super(args.error_description || args.error || "");
      this.form = form;
      this.name = "ErrorResponse";
      if (!args.error) {
        Logger.error("ErrorResponse", "No error passed");
        throw new Error("No error passed");
      }
      this.error = args.error;
      this.error_description = (_a13 = args.error_description) != null ? _a13 : null;
      this.error_uri = (_b = args.error_uri) != null ? _b : null;
      this.state = args.userState;
      this.session_state = (_c = args.session_state) != null ? _c : null;
      this.url_state = args.url_state;
    }
  };
  var ErrorTimeout = class extends Error {
    constructor(message) {
      super(message);
      this.name = "ErrorTimeout";
    }
  };
  var AccessTokenEvents = class {
    constructor(args) {
      this._logger = new Logger("AccessTokenEvents");
      this._expiringTimer = new Timer("Access token expiring");
      this._expiredTimer = new Timer("Access token expired");
      this._expiringNotificationTimeInSeconds = args.expiringNotificationTimeInSeconds;
    }
    async load(container) {
      const logger2 = this._logger.create("load");
      if (container.access_token && container.expires_in !== void 0) {
        const duration = container.expires_in;
        logger2.debug("access token present, remaining duration:", duration);
        if (duration > 0) {
          let expiring = duration - this._expiringNotificationTimeInSeconds;
          if (expiring <= 0) {
            expiring = 1;
          }
          logger2.debug("registering expiring timer, raising in", expiring, "seconds");
          this._expiringTimer.init(expiring);
        } else {
          logger2.debug("canceling existing expiring timer because we're past expiration.");
          this._expiringTimer.cancel();
        }
        const expired = duration + 1;
        logger2.debug("registering expired timer, raising in", expired, "seconds");
        this._expiredTimer.init(expired);
      } else {
        this._expiringTimer.cancel();
        this._expiredTimer.cancel();
      }
    }
    async unload() {
      this._logger.debug("unload: canceling existing access token timers");
      this._expiringTimer.cancel();
      this._expiredTimer.cancel();
    }
    /**
     * Add callback: Raised prior to the access token expiring.
     */
    addAccessTokenExpiring(cb) {
      return this._expiringTimer.addHandler(cb);
    }
    /**
     * Remove callback: Raised prior to the access token expiring.
     */
    removeAccessTokenExpiring(cb) {
      this._expiringTimer.removeHandler(cb);
    }
    /**
     * Add callback: Raised after the access token has expired.
     */
    addAccessTokenExpired(cb) {
      return this._expiredTimer.addHandler(cb);
    }
    /**
     * Remove callback: Raised after the access token has expired.
     */
    removeAccessTokenExpired(cb) {
      this._expiredTimer.removeHandler(cb);
    }
  };
  var CheckSessionIFrame = class {
    constructor(_callback, _client_id, url, _intervalInSeconds, _stopOnError) {
      this._callback = _callback;
      this._client_id = _client_id;
      this._intervalInSeconds = _intervalInSeconds;
      this._stopOnError = _stopOnError;
      this._logger = new Logger("CheckSessionIFrame");
      this._timer = null;
      this._session_state = null;
      this._message = (e) => {
        if (e.origin === this._frame_origin && e.source === this._frame.contentWindow) {
          if (e.data === "error") {
            this._logger.error("error message from check session op iframe");
            if (this._stopOnError) {
              this.stop();
            }
          } else if (e.data === "changed") {
            this._logger.debug("changed message from check session op iframe");
            this.stop();
            void this._callback();
          } else {
            this._logger.debug(e.data + " message from check session op iframe");
          }
        }
      };
      const parsedUrl = new URL(url);
      this._frame_origin = parsedUrl.origin;
      this._frame = window.document.createElement("iframe");
      this._frame.style.visibility = "hidden";
      this._frame.style.position = "fixed";
      this._frame.style.left = "-1000px";
      this._frame.style.top = "0";
      this._frame.width = "0";
      this._frame.height = "0";
      this._frame.src = parsedUrl.href;
    }
    load() {
      return new Promise((resolve) => {
        this._frame.onload = () => {
          resolve();
        };
        window.document.body.appendChild(this._frame);
        window.addEventListener("message", this._message, false);
      });
    }
    start(session_state) {
      if (this._session_state === session_state) {
        return;
      }
      this._logger.create("start");
      this.stop();
      this._session_state = session_state;
      const send = () => {
        if (!this._frame.contentWindow || !this._session_state) {
          return;
        }
        this._frame.contentWindow.postMessage(this._client_id + " " + this._session_state, this._frame_origin);
      };
      send();
      this._timer = setInterval(send, this._intervalInSeconds * 1e3);
    }
    stop() {
      this._logger.create("stop");
      this._session_state = null;
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    }
  };
  var InMemoryWebStorage = class {
    constructor() {
      this._logger = new Logger("InMemoryWebStorage");
      this._data = {};
    }
    clear() {
      this._logger.create("clear");
      this._data = {};
    }
    getItem(key) {
      this._logger.create(`getItem('${key}')`);
      return this._data[key];
    }
    setItem(key, value) {
      this._logger.create(`setItem('${key}')`);
      this._data[key] = value;
    }
    removeItem(key) {
      this._logger.create(`removeItem('${key}')`);
      delete this._data[key];
    }
    get length() {
      return Object.getOwnPropertyNames(this._data).length;
    }
    key(index) {
      return Object.getOwnPropertyNames(this._data)[index];
    }
  };
  var ErrorDPoPNonce = class extends Error {
    constructor(nonce, message) {
      super(message);
      this.name = "ErrorDPoPNonce";
      this.nonce = nonce;
    }
  };
  var JsonService = class {
    constructor(additionalContentTypes = [], _jwtHandler = null, _extraHeaders = {}) {
      this._jwtHandler = _jwtHandler;
      this._extraHeaders = _extraHeaders;
      this._logger = new Logger("JsonService");
      this._contentTypes = [];
      this._contentTypes.push(...additionalContentTypes, "application/json");
      if (_jwtHandler) {
        this._contentTypes.push("application/jwt");
      }
    }
    async fetchWithTimeout(input, init3 = {}) {
      const { timeoutInSeconds, ...initFetch } = init3;
      if (!timeoutInSeconds) {
        return await fetch(input, initFetch);
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutInSeconds * 1e3);
      try {
        const response = await fetch(input, {
          ...init3,
          signal: controller.signal
        });
        return response;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new ErrorTimeout("Network timed out");
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    }
    async getJson(url, {
      token,
      credentials,
      timeoutInSeconds
    } = {}) {
      const logger2 = this._logger.create("getJson");
      const headers = {
        "Accept": this._contentTypes.join(", ")
      };
      if (token) {
        logger2.debug("token passed, setting Authorization header");
        headers["Authorization"] = "Bearer " + token;
      }
      this._appendExtraHeaders(headers);
      let response;
      try {
        logger2.debug("url:", url);
        response = await this.fetchWithTimeout(url, { method: "GET", headers, timeoutInSeconds, credentials });
      } catch (err) {
        logger2.error("Network Error");
        throw err;
      }
      logger2.debug("HTTP response received, status", response.status);
      const contentType = response.headers.get("Content-Type");
      if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
        logger2.throw(new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`));
      }
      if (response.ok && this._jwtHandler && (contentType == null ? void 0 : contentType.startsWith("application/jwt"))) {
        return await this._jwtHandler(await response.text());
      }
      let json;
      try {
        json = await response.json();
      } catch (err) {
        logger2.error("Error parsing JSON response", err);
        if (response.ok)
          throw err;
        throw new Error(`${response.statusText} (${response.status})`);
      }
      if (!response.ok) {
        logger2.error("Error from server:", json);
        if (json.error) {
          throw new ErrorResponse(json);
        }
        throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
      }
      return json;
    }
    async postForm(url, {
      body,
      basicAuth,
      timeoutInSeconds,
      initCredentials,
      extraHeaders
    }) {
      const logger2 = this._logger.create("postForm");
      const headers = {
        "Accept": this._contentTypes.join(", "),
        "Content-Type": "application/x-www-form-urlencoded",
        ...extraHeaders
      };
      if (basicAuth !== void 0) {
        headers["Authorization"] = "Basic " + basicAuth;
      }
      this._appendExtraHeaders(headers);
      let response;
      try {
        logger2.debug("url:", url);
        response = await this.fetchWithTimeout(url, { method: "POST", headers, body, timeoutInSeconds, credentials: initCredentials });
      } catch (err) {
        logger2.error("Network error");
        throw err;
      }
      logger2.debug("HTTP response received, status", response.status);
      const contentType = response.headers.get("Content-Type");
      if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
        throw new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`);
      }
      const responseText = await response.text();
      let json = {};
      if (responseText) {
        try {
          json = JSON.parse(responseText);
        } catch (err) {
          logger2.error("Error parsing JSON response", err);
          if (response.ok)
            throw err;
          throw new Error(`${response.statusText} (${response.status})`);
        }
      }
      if (!response.ok) {
        logger2.error("Error from server:", json);
        if (response.headers.has("dpop-nonce")) {
          const nonce = response.headers.get("dpop-nonce");
          throw new ErrorDPoPNonce(nonce, `${JSON.stringify(json)}`);
        }
        if (json.error) {
          throw new ErrorResponse(json, body);
        }
        throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
      }
      return json;
    }
    _appendExtraHeaders(headers) {
      const logger2 = this._logger.create("appendExtraHeaders");
      const customKeys = Object.keys(this._extraHeaders);
      const protectedHeaders = [
        "accept",
        "content-type"
      ];
      const preventOverride = [
        "authorization"
      ];
      if (customKeys.length === 0) {
        return;
      }
      customKeys.forEach((headerName) => {
        if (protectedHeaders.includes(headerName.toLocaleLowerCase())) {
          logger2.warn("Protected header could not be set", headerName, protectedHeaders);
          return;
        }
        if (preventOverride.includes(headerName.toLocaleLowerCase()) && Object.keys(headers).includes(headerName)) {
          logger2.warn("Header could not be overridden", headerName, preventOverride);
          return;
        }
        const content = typeof this._extraHeaders[headerName] === "function" ? this._extraHeaders[headerName]() : this._extraHeaders[headerName];
        if (content && content !== "") {
          headers[headerName] = content;
        }
      });
    }
  };
  var MetadataService = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("MetadataService");
      this._signingKeys = null;
      this._metadata = null;
      this._metadataUrl = this._settings.metadataUrl;
      this._jsonService = new JsonService(
        ["application/jwk-set+json"],
        null,
        this._settings.extraHeaders
      );
      if (this._settings.signingKeys) {
        this._logger.debug("using signingKeys from settings");
        this._signingKeys = this._settings.signingKeys;
      }
      if (this._settings.metadata) {
        this._logger.debug("using metadata from settings");
        this._metadata = this._settings.metadata;
      }
      if (this._settings.fetchRequestCredentials) {
        this._logger.debug("using fetchRequestCredentials from settings");
        this._fetchRequestCredentials = this._settings.fetchRequestCredentials;
      }
    }
    resetSigningKeys() {
      this._signingKeys = null;
    }
    async getMetadata() {
      const logger2 = this._logger.create("getMetadata");
      if (this._metadata) {
        logger2.debug("using cached values");
        return this._metadata;
      }
      if (!this._metadataUrl) {
        logger2.throw(new Error("No authority or metadataUrl configured on settings"));
        throw null;
      }
      logger2.debug("getting metadata from", this._metadataUrl);
      const metadata = await this._jsonService.getJson(this._metadataUrl, { credentials: this._fetchRequestCredentials, timeoutInSeconds: this._settings.requestTimeoutInSeconds });
      logger2.debug("merging remote JSON with seed metadata");
      this._metadata = Object.assign({}, metadata, this._settings.metadataSeed);
      return this._metadata;
    }
    getIssuer() {
      return this._getMetadataProperty("issuer");
    }
    getAuthorizationEndpoint() {
      return this._getMetadataProperty("authorization_endpoint");
    }
    getUserInfoEndpoint() {
      return this._getMetadataProperty("userinfo_endpoint");
    }
    getTokenEndpoint(optional = true) {
      return this._getMetadataProperty("token_endpoint", optional);
    }
    getCheckSessionIframe() {
      return this._getMetadataProperty("check_session_iframe", true);
    }
    getEndSessionEndpoint() {
      return this._getMetadataProperty("end_session_endpoint", true);
    }
    getRevocationEndpoint(optional = true) {
      return this._getMetadataProperty("revocation_endpoint", optional);
    }
    getKeysEndpoint(optional = true) {
      return this._getMetadataProperty("jwks_uri", optional);
    }
    async _getMetadataProperty(name, optional = false) {
      const logger2 = this._logger.create(`_getMetadataProperty('${name}')`);
      const metadata = await this.getMetadata();
      logger2.debug("resolved");
      if (metadata[name] === void 0) {
        if (optional === true) {
          logger2.warn("Metadata does not contain optional property");
          return void 0;
        }
        logger2.throw(new Error("Metadata does not contain property " + name));
      }
      return metadata[name];
    }
    async getSigningKeys() {
      const logger2 = this._logger.create("getSigningKeys");
      if (this._signingKeys) {
        logger2.debug("returning signingKeys from cache");
        return this._signingKeys;
      }
      const jwks_uri = await this.getKeysEndpoint(false);
      logger2.debug("got jwks_uri", jwks_uri);
      const keySet = await this._jsonService.getJson(jwks_uri, { timeoutInSeconds: this._settings.requestTimeoutInSeconds });
      logger2.debug("got key set", keySet);
      if (!Array.isArray(keySet.keys)) {
        logger2.throw(new Error("Missing keys on keyset"));
        throw null;
      }
      this._signingKeys = keySet.keys;
      return this._signingKeys;
    }
  };
  var WebStorageStateStore = class {
    constructor({
      prefix = "oidc.",
      store = localStorage
    } = {}) {
      this._logger = new Logger("WebStorageStateStore");
      this._store = store;
      this._prefix = prefix;
    }
    async set(key, value) {
      this._logger.create(`set('${key}')`);
      key = this._prefix + key;
      await this._store.setItem(key, value);
    }
    async get(key) {
      this._logger.create(`get('${key}')`);
      key = this._prefix + key;
      const item = await this._store.getItem(key);
      return item;
    }
    async remove(key) {
      this._logger.create(`remove('${key}')`);
      key = this._prefix + key;
      const item = await this._store.getItem(key);
      await this._store.removeItem(key);
      return item;
    }
    async getAllKeys() {
      this._logger.create("getAllKeys");
      const len = await this._store.length;
      const keys = [];
      for (let index = 0; index < len; index++) {
        const key = await this._store.key(index);
        if (key && key.indexOf(this._prefix) === 0) {
          keys.push(key.substr(this._prefix.length));
        }
      }
      return keys;
    }
  };
  var DefaultResponseType = "code";
  var DefaultScope = "openid";
  var DefaultClientAuthentication = "client_secret_post";
  var DefaultStaleStateAgeInSeconds = 60 * 15;
  var OidcClientSettingsStore = class {
    constructor({
      // metadata related
      authority,
      metadataUrl,
      metadata,
      signingKeys,
      metadataSeed,
      // client related
      client_id,
      client_secret,
      response_type = DefaultResponseType,
      scope = DefaultScope,
      redirect_uri,
      post_logout_redirect_uri,
      client_authentication = DefaultClientAuthentication,
      token_endpoint_auth_signing_alg = "HS256",
      // optional protocol
      prompt,
      display,
      max_age,
      ui_locales,
      acr_values,
      resource,
      response_mode,
      // behavior flags
      filterProtocolClaims = true,
      loadUserInfo = false,
      requestTimeoutInSeconds,
      staleStateAgeInSeconds = DefaultStaleStateAgeInSeconds,
      mergeClaimsStrategy = { array: "replace" },
      disablePKCE = false,
      // other behavior
      stateStore,
      revokeTokenAdditionalContentTypes,
      fetchRequestCredentials,
      refreshTokenAllowedScope,
      // extra
      extraQueryParams = {},
      extraTokenParams = {},
      extraHeaders = {},
      dpop,
      omitScopeWhenRequesting = false
    }) {
      var _a13;
      this.authority = authority;
      if (metadataUrl) {
        this.metadataUrl = metadataUrl;
      } else {
        this.metadataUrl = authority;
        if (authority) {
          if (!this.metadataUrl.endsWith("/")) {
            this.metadataUrl += "/";
          }
          this.metadataUrl += ".well-known/openid-configuration";
        }
      }
      this.metadata = metadata;
      this.metadataSeed = metadataSeed;
      this.signingKeys = signingKeys;
      this.client_id = client_id;
      this.client_secret = client_secret;
      this.response_type = response_type;
      this.scope = scope;
      this.redirect_uri = redirect_uri;
      this.post_logout_redirect_uri = post_logout_redirect_uri;
      this.client_authentication = client_authentication;
      this.token_endpoint_auth_signing_alg = token_endpoint_auth_signing_alg;
      this.prompt = prompt;
      this.display = display;
      this.max_age = max_age;
      this.ui_locales = ui_locales;
      this.acr_values = acr_values;
      this.resource = resource;
      this.response_mode = response_mode;
      this.filterProtocolClaims = filterProtocolClaims != null ? filterProtocolClaims : true;
      this.loadUserInfo = !!loadUserInfo;
      this.staleStateAgeInSeconds = staleStateAgeInSeconds;
      this.mergeClaimsStrategy = mergeClaimsStrategy;
      this.omitScopeWhenRequesting = omitScopeWhenRequesting;
      this.disablePKCE = !!disablePKCE;
      this.revokeTokenAdditionalContentTypes = revokeTokenAdditionalContentTypes;
      this.fetchRequestCredentials = fetchRequestCredentials ? fetchRequestCredentials : "same-origin";
      this.requestTimeoutInSeconds = requestTimeoutInSeconds;
      if (stateStore) {
        this.stateStore = stateStore;
      } else {
        const store = typeof window !== "undefined" ? window.localStorage : new InMemoryWebStorage();
        this.stateStore = new WebStorageStateStore({ store });
      }
      this.refreshTokenAllowedScope = refreshTokenAllowedScope;
      this.extraQueryParams = extraQueryParams;
      this.extraTokenParams = extraTokenParams;
      this.extraHeaders = extraHeaders;
      this.dpop = dpop;
      if (this.dpop && !((_a13 = this.dpop) == null ? void 0 : _a13.store)) {
        throw new Error("A DPoPStore is required when dpop is enabled");
      }
    }
  };
  var UserInfoService = class {
    constructor(_settings, _metadataService) {
      this._settings = _settings;
      this._metadataService = _metadataService;
      this._logger = new Logger("UserInfoService");
      this._getClaimsFromJwt = async (responseText) => {
        const logger2 = this._logger.create("_getClaimsFromJwt");
        try {
          const payload = JwtUtils.decode(responseText);
          logger2.debug("JWT decoding successful");
          return payload;
        } catch (err) {
          logger2.error("Error parsing JWT response");
          throw err;
        }
      };
      this._jsonService = new JsonService(
        void 0,
        this._getClaimsFromJwt,
        this._settings.extraHeaders
      );
    }
    async getClaims(token) {
      const logger2 = this._logger.create("getClaims");
      if (!token) {
        this._logger.throw(new Error("No token passed"));
      }
      const url = await this._metadataService.getUserInfoEndpoint();
      logger2.debug("got userinfo url", url);
      const claims = await this._jsonService.getJson(url, {
        token,
        credentials: this._settings.fetchRequestCredentials,
        timeoutInSeconds: this._settings.requestTimeoutInSeconds
      });
      logger2.debug("got claims", claims);
      return claims;
    }
  };
  var TokenClient = class {
    constructor(_settings, _metadataService) {
      this._settings = _settings;
      this._metadataService = _metadataService;
      this._logger = new Logger("TokenClient");
      this._jsonService = new JsonService(
        this._settings.revokeTokenAdditionalContentTypes,
        null,
        this._settings.extraHeaders
      );
    }
    /**
     * Exchange code.
     *
     * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
     */
    async exchangeCode({
      grant_type = "authorization_code",
      redirect_uri = this._settings.redirect_uri,
      client_id = this._settings.client_id,
      client_secret = this._settings.client_secret,
      extraHeaders,
      ...args
    }) {
      const logger2 = this._logger.create("exchangeCode");
      if (!client_id) {
        logger2.throw(new Error("A client_id is required"));
      }
      if (!redirect_uri) {
        logger2.throw(new Error("A redirect_uri is required"));
      }
      if (!args.code) {
        logger2.throw(new Error("A code is required"));
      }
      const params = new URLSearchParams({ grant_type, redirect_uri });
      for (const [key, value] of Object.entries(args)) {
        if (value != null) {
          params.set(key, value);
        }
      }
      if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
        logger2.throw(new Error("A client_secret is required"));
        throw null;
      }
      let basicAuth;
      const url = await this._metadataService.getTokenEndpoint(false);
      switch (this._settings.client_authentication) {
        case "client_secret_basic":
          basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
          break;
        case "client_secret_post":
          params.append("client_id", client_id);
          if (client_secret) {
            params.append("client_secret", client_secret);
          }
          break;
        case "client_secret_jwt": {
          const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
          params.append("client_id", client_id);
          params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
          params.append("client_assertion", clientAssertion);
          break;
        }
      }
      logger2.debug("got token endpoint");
      const response = await this._jsonService.postForm(url, {
        body: params,
        basicAuth,
        timeoutInSeconds: this._settings.requestTimeoutInSeconds,
        initCredentials: this._settings.fetchRequestCredentials,
        extraHeaders
      });
      logger2.debug("got response");
      return response;
    }
    /**
     * Exchange credentials.
     *
     * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.3.2
     */
    async exchangeCredentials({
      grant_type = "password",
      client_id = this._settings.client_id,
      client_secret = this._settings.client_secret,
      scope = this._settings.scope,
      ...args
    }) {
      const logger2 = this._logger.create("exchangeCredentials");
      if (!client_id) {
        logger2.throw(new Error("A client_id is required"));
      }
      const params = new URLSearchParams({ grant_type });
      if (!this._settings.omitScopeWhenRequesting) {
        params.set("scope", scope);
      }
      for (const [key, value] of Object.entries(args)) {
        if (value != null) {
          params.set(key, value);
        }
      }
      if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
        logger2.throw(new Error("A client_secret is required"));
        throw null;
      }
      let basicAuth;
      const url = await this._metadataService.getTokenEndpoint(false);
      switch (this._settings.client_authentication) {
        case "client_secret_basic":
          basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
          break;
        case "client_secret_post":
          params.append("client_id", client_id);
          if (client_secret) {
            params.append("client_secret", client_secret);
          }
          break;
        case "client_secret_jwt": {
          const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
          params.append("client_id", client_id);
          params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
          params.append("client_assertion", clientAssertion);
          break;
        }
      }
      logger2.debug("got token endpoint");
      const response = await this._jsonService.postForm(url, { body: params, basicAuth, timeoutInSeconds: this._settings.requestTimeoutInSeconds, initCredentials: this._settings.fetchRequestCredentials });
      logger2.debug("got response");
      return response;
    }
    /**
     * Exchange a refresh token.
     *
     * @see https://www.rfc-editor.org/rfc/rfc6749#section-6
     */
    async exchangeRefreshToken({
      grant_type = "refresh_token",
      client_id = this._settings.client_id,
      client_secret = this._settings.client_secret,
      timeoutInSeconds,
      extraHeaders,
      ...args
    }) {
      const logger2 = this._logger.create("exchangeRefreshToken");
      if (!client_id) {
        logger2.throw(new Error("A client_id is required"));
      }
      if (!args.refresh_token) {
        logger2.throw(new Error("A refresh_token is required"));
      }
      const params = new URLSearchParams({ grant_type });
      for (const [key, value] of Object.entries(args)) {
        if (Array.isArray(value)) {
          value.forEach((param) => params.append(key, param));
        } else if (value != null) {
          params.set(key, value);
        }
      }
      if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
        logger2.throw(new Error("A client_secret is required"));
        throw null;
      }
      let basicAuth;
      const url = await this._metadataService.getTokenEndpoint(false);
      switch (this._settings.client_authentication) {
        case "client_secret_basic":
          basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
          break;
        case "client_secret_post":
          params.append("client_id", client_id);
          if (client_secret) {
            params.append("client_secret", client_secret);
          }
          break;
        case "client_secret_jwt": {
          const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
          params.append("client_id", client_id);
          params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
          params.append("client_assertion", clientAssertion);
          break;
        }
      }
      logger2.debug("got token endpoint");
      const response = await this._jsonService.postForm(url, { body: params, basicAuth, timeoutInSeconds, initCredentials: this._settings.fetchRequestCredentials, extraHeaders });
      logger2.debug("got response");
      return response;
    }
    /**
     * Revoke an access or refresh token.
     *
     * @see https://datatracker.ietf.org/doc/html/rfc7009#section-2.1
     */
    async revoke(args) {
      var _a13;
      const logger2 = this._logger.create("revoke");
      if (!args.token) {
        logger2.throw(new Error("A token is required"));
      }
      const url = await this._metadataService.getRevocationEndpoint(false);
      logger2.debug(`got revocation endpoint, revoking ${(_a13 = args.token_type_hint) != null ? _a13 : "default token type"}`);
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(args)) {
        if (value != null) {
          params.set(key, value);
        }
      }
      params.set("client_id", this._settings.client_id);
      if (this._settings.client_secret) {
        params.set("client_secret", this._settings.client_secret);
      }
      await this._jsonService.postForm(url, { body: params, timeoutInSeconds: this._settings.requestTimeoutInSeconds });
      logger2.debug("got response");
    }
  };
  var ResponseValidator = class {
    constructor(_settings, _metadataService, _claimsService) {
      this._settings = _settings;
      this._metadataService = _metadataService;
      this._claimsService = _claimsService;
      this._logger = new Logger("ResponseValidator");
      this._userInfoService = new UserInfoService(this._settings, this._metadataService);
      this._tokenClient = new TokenClient(this._settings, this._metadataService);
    }
    async validateSigninResponse(response, state, extraHeaders) {
      const logger2 = this._logger.create("validateSigninResponse");
      this._processSigninState(response, state);
      logger2.debug("state processed");
      await this._processCode(response, state, extraHeaders);
      logger2.debug("code processed");
      if (response.isOpenId) {
        this._validateIdTokenAttributes(response);
      }
      logger2.debug("tokens validated");
      await this._processClaims(response, state == null ? void 0 : state.skipUserInfo, response.isOpenId);
      logger2.debug("claims processed");
    }
    async validateCredentialsResponse(response, skipUserInfo) {
      const logger2 = this._logger.create("validateCredentialsResponse");
      const shouldValidateSubClaim = response.isOpenId && !!response.id_token;
      if (shouldValidateSubClaim) {
        this._validateIdTokenAttributes(response);
      }
      logger2.debug("tokens validated");
      await this._processClaims(response, skipUserInfo, shouldValidateSubClaim);
      logger2.debug("claims processed");
    }
    async validateRefreshResponse(response, state) {
      var _a13, _b;
      const logger2 = this._logger.create("validateRefreshResponse");
      response.userState = state.data;
      (_a13 = response.session_state) != null ? _a13 : response.session_state = state.session_state;
      (_b = response.scope) != null ? _b : response.scope = state.scope;
      if (response.isOpenId && !!response.id_token) {
        this._validateIdTokenAttributes(response, state.id_token);
        logger2.debug("ID Token validated");
      }
      if (!response.id_token) {
        response.id_token = state.id_token;
        response.profile = state.profile;
      }
      const hasIdToken = response.isOpenId && !!response.id_token;
      await this._processClaims(response, false, hasIdToken);
      logger2.debug("claims processed");
    }
    validateSignoutResponse(response, state) {
      const logger2 = this._logger.create("validateSignoutResponse");
      if (state.id !== response.state) {
        logger2.throw(new Error("State does not match"));
      }
      logger2.debug("state validated");
      response.userState = state.data;
      if (response.error) {
        logger2.warn("Response was error", response.error);
        throw new ErrorResponse(response);
      }
    }
    _processSigninState(response, state) {
      var _a13;
      const logger2 = this._logger.create("_processSigninState");
      if (state.id !== response.state) {
        logger2.throw(new Error("State does not match"));
      }
      if (!state.client_id) {
        logger2.throw(new Error("No client_id on state"));
      }
      if (!state.authority) {
        logger2.throw(new Error("No authority on state"));
      }
      if (this._settings.authority !== state.authority) {
        logger2.throw(new Error("authority mismatch on settings vs. signin state"));
      }
      if (this._settings.client_id && this._settings.client_id !== state.client_id) {
        logger2.throw(new Error("client_id mismatch on settings vs. signin state"));
      }
      logger2.debug("state validated");
      response.userState = state.data;
      response.url_state = state.url_state;
      (_a13 = response.scope) != null ? _a13 : response.scope = state.scope;
      if (response.error) {
        logger2.warn("Response was error", response.error);
        throw new ErrorResponse(response);
      }
      if (state.code_verifier && !response.code) {
        logger2.throw(new Error("Expected code in response"));
      }
    }
    async _processClaims(response, skipUserInfo = false, validateSub = true) {
      const logger2 = this._logger.create("_processClaims");
      response.profile = this._claimsService.filterProtocolClaims(response.profile);
      if (skipUserInfo || !this._settings.loadUserInfo || !response.access_token) {
        logger2.debug("not loading user info");
        return;
      }
      logger2.debug("loading user info");
      const claims = await this._userInfoService.getClaims(response.access_token);
      logger2.debug("user info claims received from user info endpoint");
      if (validateSub && claims.sub !== response.profile.sub) {
        logger2.throw(new Error("subject from UserInfo response does not match subject in ID Token"));
      }
      response.profile = this._claimsService.mergeClaims(response.profile, this._claimsService.filterProtocolClaims(claims));
      logger2.debug("user info claims received, updated profile:", response.profile);
    }
    async _processCode(response, state, extraHeaders) {
      const logger2 = this._logger.create("_processCode");
      if (response.code) {
        logger2.debug("Validating code");
        const tokenResponse = await this._tokenClient.exchangeCode({
          client_id: state.client_id,
          client_secret: state.client_secret,
          code: response.code,
          redirect_uri: state.redirect_uri,
          code_verifier: state.code_verifier,
          extraHeaders,
          ...state.extraTokenParams
        });
        Object.assign(response, tokenResponse);
      } else {
        logger2.debug("No code to process");
      }
    }
    _validateIdTokenAttributes(response, existingToken) {
      var _a13;
      const logger2 = this._logger.create("_validateIdTokenAttributes");
      logger2.debug("decoding ID Token JWT");
      const incoming = JwtUtils.decode((_a13 = response.id_token) != null ? _a13 : "");
      if (!incoming.sub) {
        logger2.throw(new Error("ID Token is missing a subject claim"));
      }
      if (existingToken) {
        const existing = JwtUtils.decode(existingToken);
        if (incoming.sub !== existing.sub) {
          logger2.throw(new Error("sub in id_token does not match current sub"));
        }
        if (incoming.auth_time && incoming.auth_time !== existing.auth_time) {
          logger2.throw(new Error("auth_time in id_token does not match original auth_time"));
        }
        if (incoming.azp && incoming.azp !== existing.azp) {
          logger2.throw(new Error("azp in id_token does not match original azp"));
        }
        if (!incoming.azp && existing.azp) {
          logger2.throw(new Error("azp not in id_token, but present in original id_token"));
        }
      }
      response.profile = incoming;
    }
  };
  var State = class _State {
    constructor(args) {
      this.id = args.id || CryptoUtils.generateUUIDv4();
      this.data = args.data;
      if (args.created && args.created > 0) {
        this.created = args.created;
      } else {
        this.created = Timer.getEpochTime();
      }
      this.request_type = args.request_type;
      this.url_state = args.url_state;
    }
    toStorageString() {
      new Logger("State").create("toStorageString");
      return JSON.stringify({
        id: this.id,
        data: this.data,
        created: this.created,
        request_type: this.request_type,
        url_state: this.url_state
      });
    }
    static fromStorageString(storageString) {
      Logger.createStatic("State", "fromStorageString");
      return Promise.resolve(new _State(JSON.parse(storageString)));
    }
    static async clearStaleState(storage, age) {
      const logger2 = Logger.createStatic("State", "clearStaleState");
      const cutoff = Timer.getEpochTime() - age;
      const keys = await storage.getAllKeys();
      logger2.debug("got keys", keys);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const item = await storage.get(key);
        let remove = false;
        if (item) {
          try {
            const state = await _State.fromStorageString(item);
            logger2.debug("got item from key:", key, state.created);
            if (state.created <= cutoff) {
              remove = true;
            }
          } catch (err) {
            logger2.error("Error parsing state for key:", key, err);
            remove = true;
          }
        } else {
          logger2.debug("no item in storage for key:", key);
          remove = true;
        }
        if (remove) {
          logger2.debug("removed item for key:", key);
          void storage.remove(key);
        }
      }
    }
  };
  var SigninState = class _SigninState extends State {
    constructor(args) {
      super(args);
      this.code_verifier = args.code_verifier;
      this.code_challenge = args.code_challenge;
      this.authority = args.authority;
      this.client_id = args.client_id;
      this.redirect_uri = args.redirect_uri;
      this.scope = args.scope;
      this.client_secret = args.client_secret;
      this.extraTokenParams = args.extraTokenParams;
      this.response_mode = args.response_mode;
      this.skipUserInfo = args.skipUserInfo;
    }
    static async create(args) {
      const code_verifier = args.code_verifier === true ? CryptoUtils.generateCodeVerifier() : args.code_verifier || void 0;
      const code_challenge = code_verifier ? await CryptoUtils.generateCodeChallenge(code_verifier) : void 0;
      return new _SigninState({
        ...args,
        code_verifier,
        code_challenge
      });
    }
    toStorageString() {
      new Logger("SigninState").create("toStorageString");
      return JSON.stringify({
        id: this.id,
        data: this.data,
        created: this.created,
        request_type: this.request_type,
        url_state: this.url_state,
        code_verifier: this.code_verifier,
        authority: this.authority,
        client_id: this.client_id,
        redirect_uri: this.redirect_uri,
        scope: this.scope,
        client_secret: this.client_secret,
        extraTokenParams: this.extraTokenParams,
        response_mode: this.response_mode,
        skipUserInfo: this.skipUserInfo
      });
    }
    static fromStorageString(storageString) {
      Logger.createStatic("SigninState", "fromStorageString");
      const data = JSON.parse(storageString);
      return _SigninState.create(data);
    }
  };
  var _SigninRequest = class _SigninRequest2 {
    constructor(args) {
      this.url = args.url;
      this.state = args.state;
    }
    static async create({
      // mandatory
      url,
      authority,
      client_id,
      redirect_uri,
      response_type,
      scope,
      // optional
      state_data,
      response_mode,
      request_type,
      client_secret,
      nonce,
      url_state,
      resource,
      skipUserInfo,
      extraQueryParams,
      extraTokenParams,
      disablePKCE,
      dpopJkt,
      omitScopeWhenRequesting,
      ...optionalParams
    }) {
      if (!url) {
        this._logger.error("create: No url passed");
        throw new Error("url");
      }
      if (!client_id) {
        this._logger.error("create: No client_id passed");
        throw new Error("client_id");
      }
      if (!redirect_uri) {
        this._logger.error("create: No redirect_uri passed");
        throw new Error("redirect_uri");
      }
      if (!response_type) {
        this._logger.error("create: No response_type passed");
        throw new Error("response_type");
      }
      if (!scope) {
        this._logger.error("create: No scope passed");
        throw new Error("scope");
      }
      if (!authority) {
        this._logger.error("create: No authority passed");
        throw new Error("authority");
      }
      const state = await SigninState.create({
        data: state_data,
        request_type,
        url_state,
        code_verifier: !disablePKCE,
        client_id,
        authority,
        redirect_uri,
        response_mode,
        client_secret,
        scope,
        extraTokenParams,
        skipUserInfo
      });
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.append("client_id", client_id);
      parsedUrl.searchParams.append("redirect_uri", redirect_uri);
      parsedUrl.searchParams.append("response_type", response_type);
      if (!omitScopeWhenRequesting) {
        parsedUrl.searchParams.append("scope", scope);
      }
      if (nonce) {
        parsedUrl.searchParams.append("nonce", nonce);
      }
      if (dpopJkt) {
        parsedUrl.searchParams.append("dpop_jkt", dpopJkt);
      }
      let stateParam = state.id;
      if (url_state) {
        stateParam = `${stateParam}${URL_STATE_DELIMITER}${url_state}`;
      }
      parsedUrl.searchParams.append("state", stateParam);
      if (state.code_challenge) {
        parsedUrl.searchParams.append("code_challenge", state.code_challenge);
        parsedUrl.searchParams.append("code_challenge_method", "S256");
      }
      if (resource) {
        const resources = Array.isArray(resource) ? resource : [resource];
        resources.forEach((r) => parsedUrl.searchParams.append("resource", r));
      }
      for (const [key, value] of Object.entries({ response_mode, ...optionalParams, ...extraQueryParams })) {
        if (value != null) {
          parsedUrl.searchParams.append(key, value.toString());
        }
      }
      return new _SigninRequest2({
        url: parsedUrl.href,
        state
      });
    }
  };
  _SigninRequest._logger = new Logger("SigninRequest");
  var SigninRequest = _SigninRequest;
  var OidcScope = "openid";
  var SigninResponse = class {
    constructor(params) {
      this.access_token = "";
      this.token_type = "";
      this.profile = {};
      this.state = params.get("state");
      this.session_state = params.get("session_state");
      if (this.state) {
        const splitState = decodeURIComponent(this.state).split(URL_STATE_DELIMITER);
        this.state = splitState[0];
        if (splitState.length > 1) {
          this.url_state = splitState.slice(1).join(URL_STATE_DELIMITER);
        }
      }
      this.error = params.get("error");
      this.error_description = params.get("error_description");
      this.error_uri = params.get("error_uri");
      this.code = params.get("code");
    }
    get expires_in() {
      if (this.expires_at === void 0) {
        return void 0;
      }
      return this.expires_at - Timer.getEpochTime();
    }
    set expires_in(value) {
      if (typeof value === "string")
        value = Number(value);
      if (value !== void 0 && value >= 0) {
        this.expires_at = Math.floor(value) + Timer.getEpochTime();
      }
    }
    get isOpenId() {
      var _a13;
      return ((_a13 = this.scope) == null ? void 0 : _a13.split(" ").includes(OidcScope)) || !!this.id_token;
    }
  };
  var SignoutRequest = class {
    constructor({
      url,
      state_data,
      id_token_hint,
      post_logout_redirect_uri,
      extraQueryParams,
      request_type,
      client_id,
      url_state
    }) {
      this._logger = new Logger("SignoutRequest");
      if (!url) {
        this._logger.error("ctor: No url passed");
        throw new Error("url");
      }
      const parsedUrl = new URL(url);
      if (id_token_hint) {
        parsedUrl.searchParams.append("id_token_hint", id_token_hint);
      }
      if (client_id) {
        parsedUrl.searchParams.append("client_id", client_id);
      }
      if (post_logout_redirect_uri) {
        parsedUrl.searchParams.append("post_logout_redirect_uri", post_logout_redirect_uri);
        if (state_data || url_state) {
          this.state = new State({ data: state_data, request_type, url_state });
          let stateParam = this.state.id;
          if (url_state) {
            stateParam = `${stateParam}${URL_STATE_DELIMITER}${url_state}`;
          }
          parsedUrl.searchParams.append("state", stateParam);
        }
      }
      for (const [key, value] of Object.entries({ ...extraQueryParams })) {
        if (value != null) {
          parsedUrl.searchParams.append(key, value.toString());
        }
      }
      this.url = parsedUrl.href;
    }
  };
  var SignoutResponse = class {
    constructor(params) {
      this.state = params.get("state");
      if (this.state) {
        const splitState = decodeURIComponent(this.state).split(URL_STATE_DELIMITER);
        this.state = splitState[0];
        if (splitState.length > 1) {
          this.url_state = splitState.slice(1).join(URL_STATE_DELIMITER);
        }
      }
      this.error = params.get("error");
      this.error_description = params.get("error_description");
      this.error_uri = params.get("error_uri");
    }
  };
  var DefaultProtocolClaims = [
    "nbf",
    "jti",
    "auth_time",
    "nonce",
    "acr",
    "amr",
    "azp",
    "at_hash"
    // https://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken
  ];
  var InternalRequiredProtocolClaims = ["sub", "iss", "aud", "exp", "iat"];
  var ClaimsService = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("ClaimsService");
    }
    filterProtocolClaims(claims) {
      const result = { ...claims };
      if (this._settings.filterProtocolClaims) {
        let protocolClaims;
        if (Array.isArray(this._settings.filterProtocolClaims)) {
          protocolClaims = this._settings.filterProtocolClaims;
        } else {
          protocolClaims = DefaultProtocolClaims;
        }
        for (const claim of protocolClaims) {
          if (!InternalRequiredProtocolClaims.includes(claim)) {
            delete result[claim];
          }
        }
      }
      return result;
    }
    mergeClaims(claims1, claims2) {
      const result = { ...claims1 };
      for (const [claim, values] of Object.entries(claims2)) {
        if (result[claim] !== values) {
          if (Array.isArray(result[claim]) || Array.isArray(values)) {
            if (this._settings.mergeClaimsStrategy.array == "replace") {
              result[claim] = values;
            } else {
              const mergedValues = Array.isArray(result[claim]) ? result[claim] : [result[claim]];
              for (const value of Array.isArray(values) ? values : [values]) {
                if (!mergedValues.includes(value)) {
                  mergedValues.push(value);
                }
              }
              result[claim] = mergedValues;
            }
          } else if (typeof result[claim] === "object" && typeof values === "object") {
            result[claim] = this.mergeClaims(result[claim], values);
          } else {
            result[claim] = values;
          }
        }
      }
      return result;
    }
  };
  var DPoPState = class {
    constructor(keys, nonce) {
      this.keys = keys;
      this.nonce = nonce;
    }
  };
  var OidcClient = class {
    constructor(settings, metadataService) {
      this._logger = new Logger("OidcClient");
      this.settings = settings instanceof OidcClientSettingsStore ? settings : new OidcClientSettingsStore(settings);
      this.metadataService = metadataService != null ? metadataService : new MetadataService(this.settings);
      this._claimsService = new ClaimsService(this.settings);
      this._validator = new ResponseValidator(this.settings, this.metadataService, this._claimsService);
      this._tokenClient = new TokenClient(this.settings, this.metadataService);
    }
    async createSigninRequest({
      state,
      request,
      request_uri,
      request_type,
      id_token_hint,
      login_hint,
      skipUserInfo,
      nonce,
      url_state,
      response_type = this.settings.response_type,
      scope = this.settings.scope,
      redirect_uri = this.settings.redirect_uri,
      prompt = this.settings.prompt,
      display = this.settings.display,
      max_age = this.settings.max_age,
      ui_locales = this.settings.ui_locales,
      acr_values = this.settings.acr_values,
      resource = this.settings.resource,
      response_mode = this.settings.response_mode,
      extraQueryParams = this.settings.extraQueryParams,
      extraTokenParams = this.settings.extraTokenParams,
      dpopJkt,
      omitScopeWhenRequesting = this.settings.omitScopeWhenRequesting
    }) {
      const logger2 = this._logger.create("createSigninRequest");
      if (response_type !== "code") {
        throw new Error("Only the Authorization Code flow (with PKCE) is supported");
      }
      const url = await this.metadataService.getAuthorizationEndpoint();
      logger2.debug("Received authorization endpoint", url);
      const signinRequest = await SigninRequest.create({
        url,
        authority: this.settings.authority,
        client_id: this.settings.client_id,
        redirect_uri,
        response_type,
        scope,
        state_data: state,
        url_state,
        prompt,
        display,
        max_age,
        ui_locales,
        id_token_hint,
        login_hint,
        acr_values,
        dpopJkt,
        resource,
        request,
        request_uri,
        extraQueryParams,
        extraTokenParams,
        request_type,
        response_mode,
        client_secret: this.settings.client_secret,
        skipUserInfo,
        nonce,
        disablePKCE: this.settings.disablePKCE,
        omitScopeWhenRequesting
      });
      await this.clearStaleState();
      const signinState = signinRequest.state;
      await this.settings.stateStore.set(signinState.id, signinState.toStorageString());
      return signinRequest;
    }
    async readSigninResponseState(url, removeState = false) {
      const logger2 = this._logger.create("readSigninResponseState");
      const response = new SigninResponse(UrlUtils.readParams(url, this.settings.response_mode));
      if (!response.state) {
        logger2.throw(new Error("No state in response"));
        throw null;
      }
      const storedStateString = await this.settings.stateStore[removeState ? "remove" : "get"](response.state);
      if (!storedStateString) {
        logger2.throw(new Error("No matching state found in storage"));
        throw null;
      }
      const state = await SigninState.fromStorageString(storedStateString);
      return { state, response };
    }
    async processSigninResponse(url, extraHeaders, removeState = true) {
      const logger2 = this._logger.create("processSigninResponse");
      const { state, response } = await this.readSigninResponseState(url, removeState);
      logger2.debug("received state from storage; validating response");
      if (this.settings.dpop && this.settings.dpop.store) {
        const dpopProof = await this.getDpopProof(this.settings.dpop.store);
        extraHeaders = { ...extraHeaders, "DPoP": dpopProof };
      }
      try {
        await this._validator.validateSigninResponse(response, state, extraHeaders);
      } catch (err) {
        if (err instanceof ErrorDPoPNonce && this.settings.dpop) {
          const dpopProof = await this.getDpopProof(this.settings.dpop.store, err.nonce);
          extraHeaders["DPoP"] = dpopProof;
          await this._validator.validateSigninResponse(response, state, extraHeaders);
        } else {
          throw err;
        }
      }
      return response;
    }
    async getDpopProof(dpopStore, nonce) {
      let keyPair;
      let dpopState;
      if (!(await dpopStore.getAllKeys()).includes(this.settings.client_id)) {
        keyPair = await CryptoUtils.generateDPoPKeys();
        dpopState = new DPoPState(keyPair, nonce);
        await dpopStore.set(this.settings.client_id, dpopState);
      } else {
        dpopState = await dpopStore.get(this.settings.client_id);
        if (dpopState.nonce !== nonce && nonce) {
          dpopState.nonce = nonce;
          await dpopStore.set(this.settings.client_id, dpopState);
        }
      }
      return await CryptoUtils.generateDPoPProof({
        url: await this.metadataService.getTokenEndpoint(false),
        httpMethod: "POST",
        keyPair: dpopState.keys,
        nonce: dpopState.nonce
      });
    }
    async processResourceOwnerPasswordCredentials({
      username,
      password,
      skipUserInfo = false,
      extraTokenParams = {}
    }) {
      const tokenResponse = await this._tokenClient.exchangeCredentials({ username, password, ...extraTokenParams });
      const signinResponse = new SigninResponse(new URLSearchParams());
      Object.assign(signinResponse, tokenResponse);
      await this._validator.validateCredentialsResponse(signinResponse, skipUserInfo);
      return signinResponse;
    }
    async useRefreshToken({
      state,
      redirect_uri,
      resource,
      timeoutInSeconds,
      extraHeaders,
      extraTokenParams
    }) {
      var _a13;
      const logger2 = this._logger.create("useRefreshToken");
      let scope;
      if (this.settings.refreshTokenAllowedScope === void 0) {
        scope = state.scope;
      } else {
        const allowableScopes = this.settings.refreshTokenAllowedScope.split(" ");
        const providedScopes = ((_a13 = state.scope) == null ? void 0 : _a13.split(" ")) || [];
        scope = providedScopes.filter((s) => allowableScopes.includes(s)).join(" ");
      }
      if (this.settings.dpop && this.settings.dpop.store) {
        const dpopProof = await this.getDpopProof(this.settings.dpop.store);
        extraHeaders = { ...extraHeaders, "DPoP": dpopProof };
      }
      let result;
      try {
        result = await this._tokenClient.exchangeRefreshToken({
          refresh_token: state.refresh_token,
          // provide the (possible filtered) scope list
          scope,
          redirect_uri,
          resource,
          timeoutInSeconds,
          extraHeaders,
          ...extraTokenParams
        });
      } catch (err) {
        if (err instanceof ErrorDPoPNonce && this.settings.dpop) {
          extraHeaders["DPoP"] = await this.getDpopProof(this.settings.dpop.store, err.nonce);
          result = await this._tokenClient.exchangeRefreshToken({
            refresh_token: state.refresh_token,
            // provide the (possible filtered) scope list
            scope,
            redirect_uri,
            resource,
            timeoutInSeconds,
            extraHeaders,
            ...extraTokenParams
          });
        } else {
          throw err;
        }
      }
      const response = new SigninResponse(new URLSearchParams());
      Object.assign(response, result);
      logger2.debug("validating response", response);
      await this._validator.validateRefreshResponse(response, {
        ...state,
        // override the scope in the state handed over to the validator
        // so it can set the granted scope to the requested scope in case none is included in the response
        scope
      });
      return response;
    }
    async createSignoutRequest({
      state,
      id_token_hint,
      client_id,
      request_type,
      url_state,
      post_logout_redirect_uri = this.settings.post_logout_redirect_uri,
      extraQueryParams = this.settings.extraQueryParams
    } = {}) {
      const logger2 = this._logger.create("createSignoutRequest");
      const url = await this.metadataService.getEndSessionEndpoint();
      if (!url) {
        logger2.throw(new Error("No end session endpoint"));
        throw null;
      }
      logger2.debug("Received end session endpoint", url);
      if (!client_id && post_logout_redirect_uri && !id_token_hint) {
        client_id = this.settings.client_id;
      }
      const request = new SignoutRequest({
        url,
        id_token_hint,
        client_id,
        post_logout_redirect_uri,
        state_data: state,
        extraQueryParams,
        request_type,
        url_state
      });
      await this.clearStaleState();
      const signoutState = request.state;
      if (signoutState) {
        logger2.debug("Signout request has state to persist");
        await this.settings.stateStore.set(signoutState.id, signoutState.toStorageString());
      }
      return request;
    }
    async readSignoutResponseState(url, removeState = false) {
      const logger2 = this._logger.create("readSignoutResponseState");
      const response = new SignoutResponse(UrlUtils.readParams(url, this.settings.response_mode));
      if (!response.state) {
        logger2.debug("No state in response");
        if (response.error) {
          logger2.warn("Response was error:", response.error);
          throw new ErrorResponse(response);
        }
        return { state: void 0, response };
      }
      const storedStateString = await this.settings.stateStore[removeState ? "remove" : "get"](response.state);
      if (!storedStateString) {
        logger2.throw(new Error("No matching state found in storage"));
        throw null;
      }
      const state = await State.fromStorageString(storedStateString);
      return { state, response };
    }
    async processSignoutResponse(url) {
      const logger2 = this._logger.create("processSignoutResponse");
      const { state, response } = await this.readSignoutResponseState(url, true);
      if (state) {
        logger2.debug("Received state from storage; validating response");
        this._validator.validateSignoutResponse(response, state);
      } else {
        logger2.debug("No state from storage; skipping response validation");
      }
      return response;
    }
    clearStaleState() {
      this._logger.create("clearStaleState");
      return State.clearStaleState(this.settings.stateStore, this.settings.staleStateAgeInSeconds);
    }
    async revokeToken(token, type) {
      this._logger.create("revokeToken");
      return await this._tokenClient.revoke({
        token,
        token_type_hint: type
      });
    }
  };
  var SessionMonitor = class {
    constructor(_userManager) {
      this._userManager = _userManager;
      this._logger = new Logger("SessionMonitor");
      this._start = async (user) => {
        const session_state = user.session_state;
        if (!session_state) {
          return;
        }
        const logger2 = this._logger.create("_start");
        if (user.profile) {
          this._sub = user.profile.sub;
          logger2.debug("session_state", session_state, ", sub", this._sub);
        } else {
          this._sub = void 0;
          logger2.debug("session_state", session_state, ", anonymous user");
        }
        if (this._checkSessionIFrame) {
          this._checkSessionIFrame.start(session_state);
          return;
        }
        try {
          const url = await this._userManager.metadataService.getCheckSessionIframe();
          if (url) {
            logger2.debug("initializing check session iframe");
            const client_id = this._userManager.settings.client_id;
            const intervalInSeconds = this._userManager.settings.checkSessionIntervalInSeconds;
            const stopOnError = this._userManager.settings.stopCheckSessionOnError;
            const checkSessionIFrame = new CheckSessionIFrame(this._callback, client_id, url, intervalInSeconds, stopOnError);
            await checkSessionIFrame.load();
            this._checkSessionIFrame = checkSessionIFrame;
            checkSessionIFrame.start(session_state);
          } else {
            logger2.warn("no check session iframe found in the metadata");
          }
        } catch (err) {
          logger2.error("Error from getCheckSessionIframe:", err instanceof Error ? err.message : err);
        }
      };
      this._stop = () => {
        const logger2 = this._logger.create("_stop");
        this._sub = void 0;
        if (this._checkSessionIFrame) {
          this._checkSessionIFrame.stop();
        }
        if (this._userManager.settings.monitorAnonymousSession) {
          const timerHandle = setInterval(async () => {
            clearInterval(timerHandle);
            try {
              const session = await this._userManager.querySessionStatus();
              if (session) {
                const tmpUser = {
                  session_state: session.session_state,
                  profile: session.sub ? {
                    sub: session.sub
                  } : null
                };
                void this._start(tmpUser);
              }
            } catch (err) {
              logger2.error("error from querySessionStatus", err instanceof Error ? err.message : err);
            }
          }, 1e3);
        }
      };
      this._callback = async () => {
        const logger2 = this._logger.create("_callback");
        try {
          const session = await this._userManager.querySessionStatus();
          let raiseEvent = true;
          if (session && this._checkSessionIFrame) {
            if (session.sub === this._sub) {
              raiseEvent = false;
              this._checkSessionIFrame.start(session.session_state);
              logger2.debug("same sub still logged in at OP, session state has changed, restarting check session iframe; session_state", session.session_state);
              await this._userManager.events._raiseUserSessionChanged();
            } else {
              logger2.debug("different subject signed into OP", session.sub);
            }
          } else {
            logger2.debug("subject no longer signed into OP");
          }
          if (raiseEvent) {
            if (this._sub) {
              await this._userManager.events._raiseUserSignedOut();
            } else {
              await this._userManager.events._raiseUserSignedIn();
            }
          } else {
            logger2.debug("no change in session detected, no event to raise");
          }
        } catch (err) {
          if (this._sub) {
            logger2.debug("Error calling queryCurrentSigninSession; raising signed out event", err);
            await this._userManager.events._raiseUserSignedOut();
          }
        }
      };
      if (!_userManager) {
        this._logger.throw(new Error("No user manager passed"));
      }
      this._userManager.events.addUserLoaded(this._start);
      this._userManager.events.addUserUnloaded(this._stop);
      this._init().catch((err) => {
        this._logger.error(err);
      });
    }
    async _init() {
      this._logger.create("_init");
      const user = await this._userManager.getUser();
      if (user) {
        void this._start(user);
      } else if (this._userManager.settings.monitorAnonymousSession) {
        const session = await this._userManager.querySessionStatus();
        if (session) {
          const tmpUser = {
            session_state: session.session_state,
            profile: session.sub ? {
              sub: session.sub
            } : null
          };
          void this._start(tmpUser);
        }
      }
    }
  };
  var User = class _User {
    constructor(args) {
      var _a13;
      this.id_token = args.id_token;
      this.session_state = (_a13 = args.session_state) != null ? _a13 : null;
      this.access_token = args.access_token;
      this.refresh_token = args.refresh_token;
      this.token_type = args.token_type;
      this.scope = args.scope;
      this.profile = args.profile;
      this.expires_at = args.expires_at;
      this.state = args.userState;
      this.url_state = args.url_state;
    }
    /** Computed number of seconds the access token has remaining. */
    get expires_in() {
      if (this.expires_at === void 0) {
        return void 0;
      }
      return this.expires_at - Timer.getEpochTime();
    }
    set expires_in(value) {
      if (value !== void 0) {
        this.expires_at = Math.floor(value) + Timer.getEpochTime();
      }
    }
    /** Computed value indicating if the access token is expired. */
    get expired() {
      const expires_in = this.expires_in;
      if (expires_in === void 0) {
        return void 0;
      }
      return expires_in <= 0;
    }
    /** Array representing the parsed values from the `scope`. */
    get scopes() {
      var _a13, _b;
      return (_b = (_a13 = this.scope) == null ? void 0 : _a13.split(" ")) != null ? _b : [];
    }
    toStorageString() {
      new Logger("User").create("toStorageString");
      return JSON.stringify({
        id_token: this.id_token,
        session_state: this.session_state,
        access_token: this.access_token,
        refresh_token: this.refresh_token,
        token_type: this.token_type,
        scope: this.scope,
        profile: this.profile,
        expires_at: this.expires_at
      });
    }
    static fromStorageString(storageString) {
      Logger.createStatic("User", "fromStorageString");
      return new _User(JSON.parse(storageString));
    }
  };
  var messageSource = "oidc-client";
  var AbstractChildWindow = class {
    constructor() {
      this._abort = new Event("Window navigation aborted");
      this._disposeHandlers = /* @__PURE__ */ new Set();
      this._window = null;
    }
    async navigate(params) {
      const logger2 = this._logger.create("navigate");
      if (!this._window) {
        throw new Error("Attempted to navigate on a disposed window");
      }
      logger2.debug("setting URL in window");
      this._window.location.replace(params.url);
      const { url, keepOpen } = await new Promise((resolve, reject) => {
        const listener = (e) => {
          var _a13;
          const data = e.data;
          const origin = (_a13 = params.scriptOrigin) != null ? _a13 : window.location.origin;
          if (e.origin !== origin || (data == null ? void 0 : data.source) !== messageSource) {
            return;
          }
          try {
            const state = UrlUtils.readParams(data.url, params.response_mode).get("state");
            if (!state) {
              logger2.warn("no state found in response url");
            }
            if (e.source !== this._window && state !== params.state) {
              return;
            }
          } catch {
            this._dispose();
            reject(new Error("Invalid response from window"));
          }
          resolve(data);
        };
        window.addEventListener("message", listener, false);
        this._disposeHandlers.add(() => window.removeEventListener("message", listener, false));
        const channel = new BroadcastChannel(`oidc-client-popup-${params.state}`);
        channel.addEventListener("message", listener, false);
        this._disposeHandlers.add(() => channel.close());
        this._disposeHandlers.add(this._abort.addHandler((reason) => {
          this._dispose();
          reject(reason);
        }));
      });
      logger2.debug("got response from window");
      this._dispose();
      if (!keepOpen) {
        this.close();
      }
      return { url };
    }
    _dispose() {
      this._logger.create("_dispose");
      for (const dispose of this._disposeHandlers) {
        dispose();
      }
      this._disposeHandlers.clear();
    }
    static _notifyParent(parent, url, keepOpen = false, targetOrigin = window.location.origin) {
      const msgData = {
        source: messageSource,
        url,
        keepOpen
      };
      const logger2 = new Logger("_notifyParent");
      if (parent) {
        logger2.debug("With parent. Using parent.postMessage.");
        parent.postMessage(msgData, targetOrigin);
      } else {
        logger2.debug("No parent. Using BroadcastChannel.");
        const state = new URL(url).searchParams.get("state");
        if (!state) {
          throw new Error("No parent and no state in URL. Can't complete notification.");
        }
        const channel = new BroadcastChannel(`oidc-client-popup-${state}`);
        channel.postMessage(msgData);
        channel.close();
      }
    }
  };
  var DefaultPopupWindowFeatures = {
    location: false,
    toolbar: false,
    height: 640,
    closePopupWindowAfterInSeconds: -1
  };
  var DefaultPopupTarget = "_blank";
  var DefaultAccessTokenExpiringNotificationTimeInSeconds = 60;
  var DefaultCheckSessionIntervalInSeconds = 2;
  var DefaultSilentRequestTimeoutInSeconds = 10;
  var UserManagerSettingsStore = class extends OidcClientSettingsStore {
    constructor(args) {
      const {
        popup_redirect_uri = args.redirect_uri,
        popup_post_logout_redirect_uri = args.post_logout_redirect_uri,
        popupWindowFeatures = DefaultPopupWindowFeatures,
        popupWindowTarget = DefaultPopupTarget,
        redirectMethod = "assign",
        redirectTarget = "self",
        iframeNotifyParentOrigin = args.iframeNotifyParentOrigin,
        iframeScriptOrigin = args.iframeScriptOrigin,
        requestTimeoutInSeconds,
        silent_redirect_uri = args.redirect_uri,
        silentRequestTimeoutInSeconds,
        automaticSilentRenew = true,
        validateSubOnSilentRenew = true,
        includeIdTokenInSilentRenew = false,
        monitorSession = false,
        monitorAnonymousSession = false,
        checkSessionIntervalInSeconds = DefaultCheckSessionIntervalInSeconds,
        query_status_response_type = "code",
        stopCheckSessionOnError = true,
        revokeTokenTypes = ["access_token", "refresh_token"],
        revokeTokensOnSignout = false,
        includeIdTokenInSilentSignout = false,
        accessTokenExpiringNotificationTimeInSeconds = DefaultAccessTokenExpiringNotificationTimeInSeconds,
        userStore
      } = args;
      super(args);
      this.popup_redirect_uri = popup_redirect_uri;
      this.popup_post_logout_redirect_uri = popup_post_logout_redirect_uri;
      this.popupWindowFeatures = popupWindowFeatures;
      this.popupWindowTarget = popupWindowTarget;
      this.redirectMethod = redirectMethod;
      this.redirectTarget = redirectTarget;
      this.iframeNotifyParentOrigin = iframeNotifyParentOrigin;
      this.iframeScriptOrigin = iframeScriptOrigin;
      this.silent_redirect_uri = silent_redirect_uri;
      this.silentRequestTimeoutInSeconds = silentRequestTimeoutInSeconds || requestTimeoutInSeconds || DefaultSilentRequestTimeoutInSeconds;
      this.automaticSilentRenew = automaticSilentRenew;
      this.validateSubOnSilentRenew = validateSubOnSilentRenew;
      this.includeIdTokenInSilentRenew = includeIdTokenInSilentRenew;
      this.monitorSession = monitorSession;
      this.monitorAnonymousSession = monitorAnonymousSession;
      this.checkSessionIntervalInSeconds = checkSessionIntervalInSeconds;
      this.stopCheckSessionOnError = stopCheckSessionOnError;
      this.query_status_response_type = query_status_response_type;
      this.revokeTokenTypes = revokeTokenTypes;
      this.revokeTokensOnSignout = revokeTokensOnSignout;
      this.includeIdTokenInSilentSignout = includeIdTokenInSilentSignout;
      this.accessTokenExpiringNotificationTimeInSeconds = accessTokenExpiringNotificationTimeInSeconds;
      if (userStore) {
        this.userStore = userStore;
      } else {
        const store = typeof window !== "undefined" ? window.sessionStorage : new InMemoryWebStorage();
        this.userStore = new WebStorageStateStore({ store });
      }
    }
  };
  var IFrameWindow = class _IFrameWindow extends AbstractChildWindow {
    constructor({
      silentRequestTimeoutInSeconds = DefaultSilentRequestTimeoutInSeconds
    }) {
      super();
      this._logger = new Logger("IFrameWindow");
      this._timeoutInSeconds = silentRequestTimeoutInSeconds;
      this._frame = _IFrameWindow.createHiddenIframe();
      this._window = this._frame.contentWindow;
    }
    static createHiddenIframe() {
      const iframe = window.document.createElement("iframe");
      iframe.style.visibility = "hidden";
      iframe.style.position = "fixed";
      iframe.style.left = "-1000px";
      iframe.style.top = "0";
      iframe.width = "0";
      iframe.height = "0";
      window.document.body.appendChild(iframe);
      return iframe;
    }
    async navigate(params) {
      this._logger.debug("navigate: Using timeout of:", this._timeoutInSeconds);
      const timer = setTimeout(() => void this._abort.raise(new ErrorTimeout("IFrame timed out without a response")), this._timeoutInSeconds * 1e3);
      this._disposeHandlers.add(() => clearTimeout(timer));
      return await super.navigate(params);
    }
    close() {
      var _a13;
      if (this._frame) {
        if (this._frame.parentNode) {
          this._frame.addEventListener("load", (ev) => {
            var _a22;
            const frame = ev.target;
            (_a22 = frame.parentNode) == null ? void 0 : _a22.removeChild(frame);
            void this._abort.raise(new Error("IFrame removed from DOM"));
          }, true);
          (_a13 = this._frame.contentWindow) == null ? void 0 : _a13.location.replace("about:blank");
        }
        this._frame = null;
      }
      this._window = null;
    }
    static notifyParent(url, targetOrigin) {
      return super._notifyParent(window.parent, url, false, targetOrigin);
    }
  };
  var IFrameNavigator = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("IFrameNavigator");
    }
    async prepare({
      silentRequestTimeoutInSeconds = this._settings.silentRequestTimeoutInSeconds
    }) {
      return new IFrameWindow({ silentRequestTimeoutInSeconds });
    }
    async callback(url) {
      this._logger.create("callback");
      IFrameWindow.notifyParent(url, this._settings.iframeNotifyParentOrigin);
    }
  };
  var checkForPopupClosedInterval = 500;
  var second = 1e3;
  var PopupWindow = class extends AbstractChildWindow {
    constructor({
      popupWindowTarget = DefaultPopupTarget,
      popupWindowFeatures = {},
      popupSignal,
      popupAbortOnClose
    }) {
      super();
      this._logger = new Logger("PopupWindow");
      const centeredPopup = PopupUtils.center({ ...DefaultPopupWindowFeatures, ...popupWindowFeatures });
      this._window = window.open(void 0, popupWindowTarget, PopupUtils.serialize(centeredPopup));
      this.abortOnClose = Boolean(popupAbortOnClose);
      if (popupSignal) {
        popupSignal.addEventListener("abort", () => {
          var _a13;
          void this._abort.raise(new Error((_a13 = popupSignal.reason) != null ? _a13 : "Popup aborted"));
        });
      }
      if (popupWindowFeatures.closePopupWindowAfterInSeconds && popupWindowFeatures.closePopupWindowAfterInSeconds > 0) {
        setTimeout(() => {
          if (!this._window || typeof this._window.closed !== "boolean" || this._window.closed) {
            void this._abort.raise(new Error("Popup blocked by user"));
            return;
          }
          this.close();
        }, popupWindowFeatures.closePopupWindowAfterInSeconds * second);
      }
    }
    async navigate(params) {
      var _a13;
      (_a13 = this._window) == null ? void 0 : _a13.focus();
      const popupClosedInterval = setInterval(() => {
        if (!this._window || this._window.closed) {
          this._logger.debug("Popup closed by user or isolated by redirect");
          clearPopupClosedInterval();
          this._disposeHandlers.delete(clearPopupClosedInterval);
          if (this.abortOnClose) {
            void this._abort.raise(new Error("Popup closed by user"));
          }
        }
      }, checkForPopupClosedInterval);
      const clearPopupClosedInterval = () => clearInterval(popupClosedInterval);
      this._disposeHandlers.add(clearPopupClosedInterval);
      return await super.navigate(params);
    }
    close() {
      if (this._window) {
        if (!this._window.closed) {
          this._window.close();
          void this._abort.raise(new Error("Popup closed"));
        }
      }
      this._window = null;
    }
    static notifyOpener(url, keepOpen) {
      super._notifyParent(window.opener, url, keepOpen);
      if (!keepOpen && !window.opener) {
        window.close();
      }
    }
  };
  var PopupNavigator = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("PopupNavigator");
    }
    async prepare({
      popupWindowFeatures = this._settings.popupWindowFeatures,
      popupWindowTarget = this._settings.popupWindowTarget,
      popupSignal,
      popupAbortOnClose
    }) {
      return new PopupWindow({
        popupWindowFeatures,
        popupWindowTarget,
        popupSignal,
        popupAbortOnClose
      });
    }
    async callback(url, { keepOpen = false }) {
      this._logger.create("callback");
      PopupWindow.notifyOpener(url, keepOpen);
    }
  };
  var RedirectNavigator = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("RedirectNavigator");
    }
    async prepare({
      redirectMethod = this._settings.redirectMethod,
      redirectTarget = this._settings.redirectTarget
    }) {
      var _a13;
      this._logger.create("prepare");
      let targetWindow = window.self;
      if (redirectTarget === "top") {
        targetWindow = (_a13 = window.top) != null ? _a13 : window.self;
      }
      const redirect = targetWindow.location[redirectMethod].bind(targetWindow.location);
      let abort;
      return {
        navigate: async (params) => {
          this._logger.create("navigate");
          const promise = new Promise((resolve, reject) => {
            abort = reject;
            window.addEventListener("pageshow", () => resolve(window.location.href));
            redirect(params.url);
          });
          return await promise;
        },
        close: () => {
          this._logger.create("close");
          abort == null ? void 0 : abort(new Error("Redirect aborted"));
          targetWindow.stop();
        }
      };
    }
    async callback() {
      return;
    }
  };
  var UserManagerEvents = class extends AccessTokenEvents {
    constructor(settings) {
      super({ expiringNotificationTimeInSeconds: settings.accessTokenExpiringNotificationTimeInSeconds });
      this._logger = new Logger("UserManagerEvents");
      this._userLoaded = new Event("User loaded");
      this._userUnloaded = new Event("User unloaded");
      this._silentRenewError = new Event("Silent renew error");
      this._userSignedIn = new Event("User signed in");
      this._userSignedOut = new Event("User signed out");
      this._userSessionChanged = new Event("User session changed");
    }
    async load(user, raiseEvent = true) {
      await super.load(user);
      if (raiseEvent) {
        await this._userLoaded.raise(user);
      }
    }
    async unload() {
      await super.unload();
      await this._userUnloaded.raise();
    }
    /**
     * Add callback: Raised when a user session has been established (or re-established).
     */
    addUserLoaded(cb) {
      return this._userLoaded.addHandler(cb);
    }
    /**
     * Remove callback: Raised when a user session has been established (or re-established).
     */
    removeUserLoaded(cb) {
      return this._userLoaded.removeHandler(cb);
    }
    /**
     * Add callback: Raised when a user session has been terminated.
     */
    addUserUnloaded(cb) {
      return this._userUnloaded.addHandler(cb);
    }
    /**
     * Remove callback: Raised when a user session has been terminated.
     */
    removeUserUnloaded(cb) {
      return this._userUnloaded.removeHandler(cb);
    }
    /**
     * Add callback: Raised when the automatic silent renew has failed.
     */
    addSilentRenewError(cb) {
      return this._silentRenewError.addHandler(cb);
    }
    /**
     * Remove callback: Raised when the automatic silent renew has failed.
     */
    removeSilentRenewError(cb) {
      return this._silentRenewError.removeHandler(cb);
    }
    /**
     * @internal
     */
    async _raiseSilentRenewError(e) {
      await this._silentRenewError.raise(e);
    }
    /**
     * Add callback: Raised when the user is signed in (when `monitorSession` is set).
     * @see {@link UserManagerSettings.monitorSession}
     */
    addUserSignedIn(cb) {
      return this._userSignedIn.addHandler(cb);
    }
    /**
     * Remove callback: Raised when the user is signed in (when `monitorSession` is set).
     */
    removeUserSignedIn(cb) {
      this._userSignedIn.removeHandler(cb);
    }
    /**
     * @internal
     */
    async _raiseUserSignedIn() {
      await this._userSignedIn.raise();
    }
    /**
     * Add callback: Raised when the user's sign-in status at the OP has changed (when `monitorSession` is set).
     * @see {@link UserManagerSettings.monitorSession}
     */
    addUserSignedOut(cb) {
      return this._userSignedOut.addHandler(cb);
    }
    /**
     * Remove callback: Raised when the user's sign-in status at the OP has changed (when `monitorSession` is set).
     */
    removeUserSignedOut(cb) {
      this._userSignedOut.removeHandler(cb);
    }
    /**
     * @internal
     */
    async _raiseUserSignedOut() {
      await this._userSignedOut.raise();
    }
    /**
     * Add callback: Raised when the user session changed (when `monitorSession` is set).
     * @see {@link UserManagerSettings.monitorSession}
     */
    addUserSessionChanged(cb) {
      return this._userSessionChanged.addHandler(cb);
    }
    /**
     * Remove callback: Raised when the user session changed (when `monitorSession` is set).
     */
    removeUserSessionChanged(cb) {
      this._userSessionChanged.removeHandler(cb);
    }
    /**
     * @internal
     */
    async _raiseUserSessionChanged() {
      await this._userSessionChanged.raise();
    }
  };
  var SilentRenewService = class {
    constructor(_userManager) {
      this._userManager = _userManager;
      this._logger = new Logger("SilentRenewService");
      this._isStarted = false;
      this._retryTimer = new Timer("Retry Silent Renew");
      this._tokenExpiring = async () => {
        const logger2 = this._logger.create("_tokenExpiring");
        try {
          await this._userManager.signinSilent();
          logger2.debug("silent token renewal successful");
        } catch (err) {
          if (err instanceof ErrorTimeout) {
            logger2.warn("ErrorTimeout from signinSilent:", err, "retry in 5s");
            this._retryTimer.init(5);
            return;
          }
          logger2.error("Error from signinSilent:", err);
          await this._userManager.events._raiseSilentRenewError(err);
        }
      };
    }
    async start() {
      const logger2 = this._logger.create("start");
      if (!this._isStarted) {
        this._isStarted = true;
        this._userManager.events.addAccessTokenExpiring(this._tokenExpiring);
        this._retryTimer.addHandler(this._tokenExpiring);
        try {
          await this._userManager.getUser();
        } catch (err) {
          logger2.error("getUser error", err);
        }
      }
    }
    stop() {
      if (this._isStarted) {
        this._retryTimer.cancel();
        this._retryTimer.removeHandler(this._tokenExpiring);
        this._userManager.events.removeAccessTokenExpiring(this._tokenExpiring);
        this._isStarted = false;
      }
    }
  };
  var RefreshState = class {
    constructor(args) {
      this.refresh_token = args.refresh_token;
      this.id_token = args.id_token;
      this.session_state = args.session_state;
      this.scope = args.scope;
      this.profile = args.profile;
      this.data = args.state;
    }
  };
  var UserManager = class {
    constructor(settings, redirectNavigator, popupNavigator, iframeNavigator) {
      this._logger = new Logger("UserManager");
      this.settings = new UserManagerSettingsStore(settings);
      this._client = new OidcClient(settings);
      this._redirectNavigator = redirectNavigator != null ? redirectNavigator : new RedirectNavigator(this.settings);
      this._popupNavigator = popupNavigator != null ? popupNavigator : new PopupNavigator(this.settings);
      this._iframeNavigator = iframeNavigator != null ? iframeNavigator : new IFrameNavigator(this.settings);
      this._events = new UserManagerEvents(this.settings);
      this._silentRenewService = new SilentRenewService(this);
      if (this.settings.automaticSilentRenew) {
        this.startSilentRenew();
      }
      this._sessionMonitor = null;
      if (this.settings.monitorSession) {
        this._sessionMonitor = new SessionMonitor(this);
      }
    }
    /**
     * Get object used to register for events raised by the `UserManager`.
     */
    get events() {
      return this._events;
    }
    /**
     * Get object used to access the metadata configuration of the identity provider.
     */
    get metadataService() {
      return this._client.metadataService;
    }
    /**
     * Load the `User` object for the currently authenticated user.
     *
     * @param raiseEvent - If `true`, the `UserLoaded` event will be raised. Defaults to false.
     * @returns A promise
     */
    async getUser(raiseEvent = false) {
      const logger2 = this._logger.create("getUser");
      const user = await this._loadUser();
      if (user) {
        logger2.info("user loaded");
        await this._events.load(user, raiseEvent);
        return user;
      }
      logger2.info("user not found in storage");
      return null;
    }
    /**
     * Remove from any storage the currently authenticated user.
     *
     * @returns A promise
     */
    async removeUser() {
      const logger2 = this._logger.create("removeUser");
      await this.storeUser(null);
      logger2.info("user removed from storage");
      await this._events.unload();
    }
    /**
     * Trigger a redirect of the current window to the authorization endpoint.
     *
     * @returns A promise
     *
     * @throws `Error` In cases of wrong authentication.
     */
    async signinRedirect(args = {}) {
      var _a13;
      this._logger.create("signinRedirect");
      const {
        redirectMethod,
        ...requestArgs
      } = args;
      let dpopJkt;
      if ((_a13 = this.settings.dpop) == null ? void 0 : _a13.bind_authorization_code) {
        dpopJkt = await this.generateDPoPJkt(this.settings.dpop);
      }
      const handle = await this._redirectNavigator.prepare({ redirectMethod });
      await this._signinStart({
        request_type: "si:r",
        dpopJkt,
        ...requestArgs
      }, handle);
    }
    /**
     * Process the response (callback) from the authorization endpoint.
     * It is recommended to use {@link UserManager.signinCallback} instead.
     *
     * @returns A promise containing the authenticated `User`.
     *
     * @see {@link UserManager.signinCallback}
     */
    async signinRedirectCallback(url = window.location.href) {
      const logger2 = this._logger.create("signinRedirectCallback");
      const user = await this._signinEnd(url);
      if (user.profile && user.profile.sub) {
        logger2.info("success, signed in subject", user.profile.sub);
      } else {
        logger2.info("no subject");
      }
      return user;
    }
    /**
     * Trigger the signin with user/password.
     *
     * @returns A promise containing the authenticated `User`.
     * @throws {@link ErrorResponse} In cases of wrong authentication.
     */
    async signinResourceOwnerCredentials({
      username,
      password,
      skipUserInfo = false
    }) {
      const logger2 = this._logger.create("signinResourceOwnerCredential");
      const signinResponse = await this._client.processResourceOwnerPasswordCredentials({
        username,
        password,
        skipUserInfo,
        extraTokenParams: this.settings.extraTokenParams
      });
      logger2.debug("got signin response");
      const user = await this._buildUser(signinResponse);
      if (user.profile && user.profile.sub) {
        logger2.info("success, signed in subject", user.profile.sub);
      } else {
        logger2.info("no subject");
      }
      return user;
    }
    /**
     * Trigger a request (via a popup window) to the authorization endpoint.
     *
     * @returns A promise containing the authenticated `User`.
     * @throws `Error` In cases of wrong authentication.
     */
    async signinPopup(args = {}) {
      var _a13;
      const logger2 = this._logger.create("signinPopup");
      let dpopJkt;
      if ((_a13 = this.settings.dpop) == null ? void 0 : _a13.bind_authorization_code) {
        dpopJkt = await this.generateDPoPJkt(this.settings.dpop);
      }
      const {
        popupWindowFeatures,
        popupWindowTarget,
        popupSignal,
        popupAbortOnClose,
        ...requestArgs
      } = args;
      const url = this.settings.popup_redirect_uri;
      if (!url) {
        logger2.throw(new Error("No popup_redirect_uri configured"));
      }
      const handle = await this._popupNavigator.prepare({ popupWindowFeatures, popupWindowTarget, popupSignal, popupAbortOnClose });
      const user = await this._signin({
        request_type: "si:p",
        redirect_uri: url,
        display: "popup",
        dpopJkt,
        ...requestArgs
      }, handle);
      if (user) {
        if (user.profile && user.profile.sub) {
          logger2.info("success, signed in subject", user.profile.sub);
        } else {
          logger2.info("no subject");
        }
      }
      return user;
    }
    /**
     * Notify the opening window of response (callback) from the authorization endpoint.
     * It is recommended to use {@link UserManager.signinCallback} instead.
     *
     * @returns A promise
     *
     * @see {@link UserManager.signinCallback}
     */
    async signinPopupCallback(url = window.location.href, keepOpen = false) {
      const logger2 = this._logger.create("signinPopupCallback");
      await this._popupNavigator.callback(url, { keepOpen });
      logger2.info("success");
    }
    /**
     * Trigger a silent request (via refresh token or an iframe) to the authorization endpoint.
     *
     * @returns A promise that contains the authenticated `User`.
     */
    async signinSilent(args = {}) {
      var _a13, _b;
      const logger2 = this._logger.create("signinSilent");
      const {
        silentRequestTimeoutInSeconds,
        ...requestArgs
      } = args;
      let user = await this._loadUser();
      if (!args.forceIframeAuth && (user == null ? void 0 : user.refresh_token)) {
        logger2.debug("using refresh token");
        const state = new RefreshState(user);
        return await this._useRefreshToken({
          state,
          redirect_uri: requestArgs.redirect_uri,
          resource: requestArgs.resource,
          extraTokenParams: requestArgs.extraTokenParams,
          timeoutInSeconds: silentRequestTimeoutInSeconds
        });
      }
      let dpopJkt;
      if ((_a13 = this.settings.dpop) == null ? void 0 : _a13.bind_authorization_code) {
        dpopJkt = await this.generateDPoPJkt(this.settings.dpop);
      }
      const url = this.settings.silent_redirect_uri;
      if (!url) {
        logger2.throw(new Error("No silent_redirect_uri configured"));
      }
      let verifySub;
      if (user && this.settings.validateSubOnSilentRenew) {
        logger2.debug("subject prior to silent renew:", user.profile.sub);
        verifySub = user.profile.sub;
      }
      const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
      user = await this._signin({
        request_type: "si:s",
        redirect_uri: url,
        prompt: "none",
        id_token_hint: this.settings.includeIdTokenInSilentRenew ? user == null ? void 0 : user.id_token : void 0,
        dpopJkt,
        ...requestArgs
      }, handle, verifySub);
      if (user) {
        if ((_b = user.profile) == null ? void 0 : _b.sub) {
          logger2.info("success, signed in subject", user.profile.sub);
        } else {
          logger2.info("no subject");
        }
      }
      return user;
    }
    async _useRefreshToken(args) {
      const response = await this._client.useRefreshToken({
        timeoutInSeconds: this.settings.silentRequestTimeoutInSeconds,
        ...args
      });
      const user = new User({ ...args.state, ...response });
      await this.storeUser(user);
      await this._events.load(user);
      return user;
    }
    /**
     *
     * Notify the parent window of response (callback) from the authorization endpoint.
     * It is recommended to use {@link UserManager.signinCallback} instead.
     *
     * @returns A promise
     *
     * @see {@link UserManager.signinCallback}
     */
    async signinSilentCallback(url = window.location.href) {
      const logger2 = this._logger.create("signinSilentCallback");
      await this._iframeNavigator.callback(url);
      logger2.info("success");
    }
    /**
     * Process any response (callback) from the authorization endpoint, by dispatching the request_type
     * and executing one of the following functions:
     * - {@link UserManager.signinRedirectCallback}
     * - {@link UserManager.signinPopupCallback}
     * - {@link UserManager.signinSilentCallback}
     *
     * @throws `Error` If request_type is unknown or signin cannot be processed.
     */
    async signinCallback(url = window.location.href) {
      const { state } = await this._client.readSigninResponseState(url);
      switch (state.request_type) {
        case "si:r":
          return await this.signinRedirectCallback(url);
        case "si:p":
          await this.signinPopupCallback(url);
          break;
        case "si:s":
          await this.signinSilentCallback(url);
          break;
        default:
          throw new Error("invalid response_type in state");
      }
      return void 0;
    }
    /**
     * Process any response (callback) from the end session endpoint, by dispatching the request_type
     * and executing one of the following functions:
     * - {@link UserManager.signoutRedirectCallback}
     * - {@link UserManager.signoutPopupCallback}
     * - {@link UserManager.signoutSilentCallback}
     *
     * @throws `Error` If request_type is unknown or signout cannot be processed.
     */
    async signoutCallback(url = window.location.href, keepOpen = false) {
      const { state } = await this._client.readSignoutResponseState(url);
      if (!state) {
        return void 0;
      }
      switch (state.request_type) {
        case "so:r":
          return await this.signoutRedirectCallback(url);
        case "so:p":
          await this.signoutPopupCallback(url, keepOpen);
          break;
        case "so:s":
          await this.signoutSilentCallback(url);
          break;
        default:
          throw new Error("invalid response_type in state");
      }
      return void 0;
    }
    /**
     * Query OP for user's current signin status.
     *
     * @returns A promise object with session_state and subject identifier.
     */
    async querySessionStatus(args = {}) {
      const logger2 = this._logger.create("querySessionStatus");
      const {
        silentRequestTimeoutInSeconds,
        ...requestArgs
      } = args;
      const url = this.settings.silent_redirect_uri;
      if (!url) {
        logger2.throw(new Error("No silent_redirect_uri configured"));
      }
      const user = await this._loadUser();
      const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
      const navResponse = await this._signinStart({
        request_type: "si:s",
        // this acts like a signin silent
        redirect_uri: url,
        prompt: "none",
        id_token_hint: this.settings.includeIdTokenInSilentRenew ? user == null ? void 0 : user.id_token : void 0,
        response_type: this.settings.query_status_response_type,
        scope: "openid",
        skipUserInfo: true,
        ...requestArgs
      }, handle);
      try {
        const extraHeaders = {};
        const signinResponse = await this._client.processSigninResponse(navResponse.url, extraHeaders);
        logger2.debug("got signin response");
        if (signinResponse.session_state && signinResponse.profile.sub) {
          logger2.info("success for subject", signinResponse.profile.sub);
          return {
            session_state: signinResponse.session_state,
            sub: signinResponse.profile.sub
          };
        }
        logger2.info("success, user not authenticated");
        return null;
      } catch (err) {
        if (this.settings.monitorAnonymousSession && err instanceof ErrorResponse) {
          switch (err.error) {
            case "login_required":
            case "consent_required":
            case "interaction_required":
            case "account_selection_required":
              logger2.info("success for anonymous user");
              return {
                session_state: err.session_state
              };
          }
        }
        throw err;
      }
    }
    async _signin(args, handle, verifySub) {
      const navResponse = await this._signinStart(args, handle);
      return await this._signinEnd(navResponse.url, verifySub);
    }
    async _signinStart(args, handle) {
      const logger2 = this._logger.create("_signinStart");
      try {
        const signinRequest = await this._client.createSigninRequest(args);
        logger2.debug("got signin request");
        return await handle.navigate({
          url: signinRequest.url,
          state: signinRequest.state.id,
          response_mode: signinRequest.state.response_mode,
          scriptOrigin: this.settings.iframeScriptOrigin
        });
      } catch (err) {
        logger2.debug("error after preparing navigator, closing navigator window");
        handle.close();
        throw err;
      }
    }
    async _signinEnd(url, verifySub) {
      const logger2 = this._logger.create("_signinEnd");
      const extraHeaders = {};
      const signinResponse = await this._client.processSigninResponse(url, extraHeaders);
      logger2.debug("got signin response");
      const user = await this._buildUser(signinResponse, verifySub);
      return user;
    }
    async _buildUser(signinResponse, verifySub) {
      const logger2 = this._logger.create("_buildUser");
      const user = new User(signinResponse);
      if (verifySub) {
        if (verifySub !== user.profile.sub) {
          logger2.debug("current user does not match user returned from signin. sub from signin:", user.profile.sub);
          throw new ErrorResponse({ ...signinResponse, error: "login_required" });
        }
        logger2.debug("current user matches user returned from signin");
      }
      await this.storeUser(user);
      logger2.debug("user stored");
      await this._events.load(user);
      return user;
    }
    /**
     * Trigger a redirect of the current window to the end session endpoint.
     *
     * @returns A promise
     */
    async signoutRedirect(args = {}) {
      const logger2 = this._logger.create("signoutRedirect");
      const {
        redirectMethod,
        ...requestArgs
      } = args;
      const handle = await this._redirectNavigator.prepare({ redirectMethod });
      await this._signoutStart({
        request_type: "so:r",
        post_logout_redirect_uri: this.settings.post_logout_redirect_uri,
        ...requestArgs
      }, handle);
      logger2.info("success");
    }
    /**
     * Process response (callback) from the end session endpoint.
     * It is recommended to use {@link UserManager.signoutCallback} instead.
     *
     * @returns A promise containing signout response
     *
     * @see {@link UserManager.signoutCallback}
     */
    async signoutRedirectCallback(url = window.location.href) {
      const logger2 = this._logger.create("signoutRedirectCallback");
      const response = await this._signoutEnd(url);
      logger2.info("success");
      return response;
    }
    /**
     * Trigger a redirect of a popup window to the end session endpoint.
     *
     * @returns A promise
     */
    async signoutPopup(args = {}) {
      const logger2 = this._logger.create("signoutPopup");
      const {
        popupWindowFeatures,
        popupWindowTarget,
        popupSignal,
        ...requestArgs
      } = args;
      const url = this.settings.popup_post_logout_redirect_uri;
      const handle = await this._popupNavigator.prepare({ popupWindowFeatures, popupWindowTarget, popupSignal });
      await this._signout({
        request_type: "so:p",
        post_logout_redirect_uri: url,
        // we're putting a dummy entry in here because we
        // need a unique id from the state for notification
        // to the parent window, which is necessary if we
        // plan to return back to the client after signout
        // and so we can close the popup after signout
        state: url == null ? void 0 : {},
        ...requestArgs
      }, handle);
      logger2.info("success");
    }
    /**
     * Process response (callback) from the end session endpoint from a popup window.
     * It is recommended to use {@link UserManager.signoutCallback} instead.
     *
     * @returns A promise
     *
     * @see {@link UserManager.signoutCallback}
     */
    async signoutPopupCallback(url = window.location.href, keepOpen = false) {
      const logger2 = this._logger.create("signoutPopupCallback");
      await this._popupNavigator.callback(url, { keepOpen });
      logger2.info("success");
    }
    async _signout(args, handle) {
      const navResponse = await this._signoutStart(args, handle);
      return await this._signoutEnd(navResponse.url);
    }
    async _signoutStart(args = {}, handle) {
      var _a13;
      const logger2 = this._logger.create("_signoutStart");
      try {
        const user = await this._loadUser();
        logger2.debug("loaded current user from storage");
        if (this.settings.revokeTokensOnSignout) {
          await this._revokeInternal(user);
        }
        const id_token = args.id_token_hint || user && user.id_token;
        if (id_token) {
          logger2.debug("setting id_token_hint in signout request");
          args.id_token_hint = id_token;
        }
        await this.removeUser();
        logger2.debug("user removed, creating signout request");
        const signoutRequest = await this._client.createSignoutRequest(args);
        logger2.debug("got signout request");
        return await handle.navigate({
          url: signoutRequest.url,
          state: (_a13 = signoutRequest.state) == null ? void 0 : _a13.id,
          scriptOrigin: this.settings.iframeScriptOrigin
        });
      } catch (err) {
        logger2.debug("error after preparing navigator, closing navigator window");
        handle.close();
        throw err;
      }
    }
    async _signoutEnd(url) {
      const logger2 = this._logger.create("_signoutEnd");
      const signoutResponse = await this._client.processSignoutResponse(url);
      logger2.debug("got signout response");
      return signoutResponse;
    }
    /**
     * Trigger a silent request (via an iframe) to the end session endpoint.
     *
     * @returns A promise
     */
    async signoutSilent(args = {}) {
      var _a13;
      const logger2 = this._logger.create("signoutSilent");
      const {
        silentRequestTimeoutInSeconds,
        ...requestArgs
      } = args;
      const id_token_hint = this.settings.includeIdTokenInSilentSignout ? (_a13 = await this._loadUser()) == null ? void 0 : _a13.id_token : void 0;
      const url = this.settings.popup_post_logout_redirect_uri;
      const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
      await this._signout({
        request_type: "so:s",
        post_logout_redirect_uri: url,
        id_token_hint,
        ...requestArgs
      }, handle);
      logger2.info("success");
    }
    /**
     * Notify the parent window of response (callback) from the end session endpoint.
     * It is recommended to use {@link UserManager.signoutCallback} instead.
     *
     * @returns A promise
     *
     * @see {@link UserManager.signoutCallback}
     */
    async signoutSilentCallback(url = window.location.href) {
      const logger2 = this._logger.create("signoutSilentCallback");
      await this._iframeNavigator.callback(url);
      logger2.info("success");
    }
    async revokeTokens(types) {
      const user = await this._loadUser();
      await this._revokeInternal(user, types);
    }
    async _revokeInternal(user, types = this.settings.revokeTokenTypes) {
      const logger2 = this._logger.create("_revokeInternal");
      if (!user)
        return;
      const typesPresent = types.filter((type) => typeof user[type] === "string");
      if (!typesPresent.length) {
        logger2.debug("no need to revoke due to no token(s)");
        return;
      }
      for (const type of typesPresent) {
        await this._client.revokeToken(
          user[type],
          type
        );
        logger2.info(`${type} revoked successfully`);
        if (type !== "access_token") {
          user[type] = null;
        }
      }
      await this.storeUser(user);
      logger2.debug("user stored");
      await this._events.load(user);
    }
    /**
     * Enables silent renew for the `UserManager`.
     */
    startSilentRenew() {
      this._logger.create("startSilentRenew");
      void this._silentRenewService.start();
    }
    /**
     * Disables silent renew for the `UserManager`.
     */
    stopSilentRenew() {
      this._silentRenewService.stop();
    }
    get _userStoreKey() {
      return `user:${this.settings.authority}:${this.settings.client_id}`;
    }
    async _loadUser() {
      const logger2 = this._logger.create("_loadUser");
      const storageString = await this.settings.userStore.get(this._userStoreKey);
      if (storageString) {
        logger2.debug("user storageString loaded");
        return User.fromStorageString(storageString);
      }
      logger2.debug("no user storageString");
      return null;
    }
    async storeUser(user) {
      const logger2 = this._logger.create("storeUser");
      if (user) {
        logger2.debug("storing user");
        const storageString = user.toStorageString();
        await this.settings.userStore.set(this._userStoreKey, storageString);
      } else {
        this._logger.debug("removing user");
        await this.settings.userStore.remove(this._userStoreKey);
        if (this.settings.dpop) {
          await this.settings.dpop.store.remove(this.settings.client_id);
        }
      }
    }
    /**
     * Removes stale state entries in storage for incomplete authorize requests.
     */
    async clearStaleState() {
      await this._client.clearStaleState();
    }
    /**
     * Dynamically generates a DPoP proof for a given user, URL and optional Http method.
     * This method is useful when you need to make a request to a resource server
     * with fetch or similar, and you need to include a DPoP proof in a DPoP header.
     * @param url - The URL to generate the DPoP proof for
     * @param user - The user to generate the DPoP proof for
     * @param httpMethod - Optional, defaults to "GET"
     * @param nonce - Optional nonce provided by the resource server
     *
     * @returns A promise containing the DPoP proof or undefined if DPoP is not enabled/no user is found.
     */
    async dpopProof(url, user, httpMethod, nonce) {
      var _a13, _b;
      const dpopState = await ((_b = (_a13 = this.settings.dpop) == null ? void 0 : _a13.store) == null ? void 0 : _b.get(this.settings.client_id));
      if (dpopState) {
        return await CryptoUtils.generateDPoPProof({
          url,
          accessToken: user == null ? void 0 : user.access_token,
          httpMethod,
          keyPair: dpopState.keys,
          nonce
        });
      }
      return void 0;
    }
    async generateDPoPJkt(dpopSettings) {
      let dpopState = await dpopSettings.store.get(this.settings.client_id);
      if (!dpopState) {
        const dpopKeys = await CryptoUtils.generateDPoPKeys();
        dpopState = new DPoPState(dpopKeys);
        await dpopSettings.store.set(this.settings.client_id, dpopState);
      }
      return await CryptoUtils.generateDPoPJkt(dpopState.keys);
    }
  };

  // auth.ts
  var OIDC_CONFIG = {
    authority: "https://auth.spacetimedb.com/oidc",
    client_id: "client_032GFAYg4gfBRBLNmGiU61",
    // REPLACE with your SpacetimeAuth Client ID
    redirect_uri: `${window.location.origin}/`,
    post_logout_redirect_uri: window.location.origin,
    scope: "openid profile email",
    response_type: "code",
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.localStorage })
  };
  var userManager = new UserManager(OIDC_CONFIG);
  async function ensureLoggedIn() {
    try {
      const user = await userManager.getUser();
      if (user && !user.expired && user.id_token) {
        console.log("[AUTH] User already logged in");
        return user.id_token;
      }
      console.log("[AUTH] User not logged in or token expired, redirecting to login...");
      await userManager.signinRedirect();
      throw new Error("Redirecting to login");
    } catch (error) {
      if (error instanceof Error && error.message === "Redirecting to login") {
        throw error;
      }
      console.error("[AUTH] Error checking login status:", error);
      await userManager.signinRedirect();
      throw new Error("Redirecting to login");
    }
  }
  async function handleCallback() {
    try {
      console.log("[AUTH] Handling OIDC callback...");
      const user = await userManager.signinRedirectCallback();
      if (!user.id_token) {
        throw new Error("No ID token received after login");
      }
      console.log("[AUTH] Successfully authenticated, ID token obtained");
      return user.id_token;
    } catch (error) {
      console.error("[AUTH] Error handling callback:", error);
      throw error;
    }
  }
  async function logout() {
    try {
      console.log("[AUTH] Logging out...");
      window.localStorage.removeItem("stdb_auth_token");
      await userManager.signoutRedirect();
    } catch (error) {
      console.error("[AUTH] Error during logout:", error);
      throw error;
    }
  }

  // spacetime-bridge.ts
  var dbConnection = null;
  var subscriptionHandle = null;
  var connectionPromise = null;
  var localPlayerIdentity = null;
  var localPlayerState = null;
  var localPlayerDisplayName = null;
  var godotChatListeners = [];
  function emitToGodotChatListeners(msg) {
    for (const cb of godotChatListeners) {
      try {
        cb(msg);
      } catch (e) {
        console.error("[BRIDGE] Error in chat listener callback:", e);
      }
    }
  }
  function registerChatListener(cb) {
    if (typeof cb !== "function") {
      console.error("[BRIDGE] register_chat_listener: callback must be a function");
      return;
    }
    godotChatListeners.push(cb);
    console.log("[BRIDGE] Registered chat listener (total listeners: " + godotChatListeners.length + ")");
  }
  var localPlayerTile = null;
  var localMoveQueueSteps = [];
  var npcDefs = /* @__PURE__ */ new Map();
  var interactableDefs = /* @__PURE__ */ new Map();
  function callGodotBridge(functionName, ...args) {
    if (typeof window === "undefined") {
      console.warn("[BRIDGE] Cannot call Godot function: window not available");
      return;
    }
    const callback = window[functionName];
    if (!callback || typeof callback !== "function") {
      console.warn(`[BRIDGE] ${functionName} callback not available, retrying in 100ms...`);
      setTimeout(() => {
        const retryCallback = window[functionName];
        if (retryCallback && typeof retryCallback === "function") {
          try {
            const retryArgsArray = [];
            for (let i = 0; i < args.length; i++) {
              retryArgsArray.push(args[i]);
            }
            console.log(`[BRIDGE] Retrying: Calling ${functionName} with args array:`, retryArgsArray, "length:", retryArgsArray.length);
            retryCallback(retryArgsArray);
          } catch (e) {
            console.error(`[BRIDGE] Error calling ${functionName} (retry):`, e);
          }
        } else {
          console.error(`[BRIDGE] ${functionName} callback not available after retry. Available callbacks:`, Object.keys(window).filter((k) => k.startsWith("bridgeOn")));
        }
      }, 100);
      return;
    }
    try {
      const argsArray = [];
      for (let i = 0; i < args.length; i++) {
        argsArray.push(args[i]);
      }
      const result = callback(argsArray);
    } catch (e) {
      console.error(`[BRIDGE] Error calling ${functionName}:`, e);
      console.error(`[BRIDGE] Callback type:`, typeof callback);
      console.error(`[BRIDGE] Callback value:`, callback);
    }
  }
  function parseQueue(queueStr) {
    if (!queueStr || queueStr.trim() === "")
      return [];
    return queueStr.split(";").map((s) => s.trim()).filter((s) => s.length > 0).map((step) => {
      const [dxStr, dyStr] = step.split(",");
      const dx = parseInt(dxStr, 10) || 0;
      const dy = parseInt(dyStr, 10) || 0;
      return { dx, dy };
    });
  }
  function buildAbsoluteTilesFromQueue(base, steps) {
    const flat = [];
    let x = base.x;
    let y = base.y;
    for (const step of steps) {
      x += step.dx;
      y += step.dy;
      flat.push(x, y);
    }
    return flat;
  }
  function isLocalPlayer(identity) {
    if (!localPlayerIdentity)
      return false;
    if (identity == null)
      return false;
    try {
      const idStr = typeof identity.toString === "function" ? identity.toString() : String(identity);
      const match = idStr === localPlayerIdentity;
      if (!match && typeof identity.toHexString === "function") {
        const hex = identity.toHexString();
        return hex === localPlayerIdentity || hex === localPlayerIdentity.replace(/^0x/i, "");
      }
      return match;
    } catch {
      return false;
    }
  }
  function onNpcSpawnAddedOrUpdated(spawn) {
    const def = npcDefs.get(spawn.npcDefId);
    const name = def ? def.name : "";
    const sprite_id = def ? def.spriteId : "";
    const default_dialogue_key = def ? def.defaultDialogueKey : "";
    const data = {
      npc_spawn_id: spawn.npcSpawnId,
      npc_def_id: spawn.npcDefId,
      zone_id: spawn.zoneId,
      tile_x: spawn.tileX,
      tile_y: spawn.tileY,
      facing: spawn.facing,
      name,
      sprite_id,
      default_dialogue_key
    };
    callGodotBridge("bridgeOnSpawnNpcFromDb", data);
  }
  function onNpcSpawnDeleted(spawn) {
    callGodotBridge("bridgeOnDespawnNpcBySpawnId", spawn.npcSpawnId);
  }
  function interactableBehaviorIdToKey(behaviorId) {
    switch (behaviorId) {
      case 1:
        return "interactable_behavior_sign";
      default:
        return "interactable_behavior_generic";
    }
  }
  function onInteractableSpawnAddedOrUpdated(spawn) {
    const def = interactableDefs.get(spawn.interactableDefId);
    const display_name = def ? def.displayName : "";
    const sprite_id = def ? def.spriteId : "";
    const default_dialogue_key = def && def.defaultDialogueKey != null ? def.defaultDialogueKey : "";
    const behavior_id = def != null && typeof def.behaviorId === "number" ? def.behaviorId : 0;
    const behavior_key = interactableBehaviorIdToKey(behavior_id);
    const data = {
      interactable_spawn_id: spawn.interactableSpawnId,
      interactable_def_id: spawn.interactableDefId,
      zone_id: spawn.zoneId,
      tile_x: spawn.tileX,
      tile_y: spawn.tileY,
      display_name,
      sprite_id,
      default_dialogue_key,
      behavior_key
    };
    callGodotBridge("bridgeOnSpawnInteractableFromDb", data);
  }
  function onInteractableSpawnDeleted(spawn) {
    callGodotBridge("bridgeOnDespawnInteractableBySpawnId", spawn.interactableSpawnId);
  }
  function onDialogueEventAddedOrUpdated(ev) {
    const options = (ev.options || []).map((opt) => ({
      id: Number(opt.id),
      label: String(opt.label || "")
    }));
    const eventId = typeof ev.eventId === "bigint" ? Number(ev.eventId) : Number(ev.eventId);
    const npcName = String(ev.npcName || "");
    const text = String(ev.text || "");
    const payload = JSON.stringify({ eventId, npcName, text, options });
    window.__dialoguePayload = payload;
    console.log("[INTERACT_DEBUG] TS PlayerDialogueEvent received, calling bridgeOnShowDialogueFromDb eventId=%s npcName=%s textLen=%s", eventId, npcName, text.length);
    callGodotBridge("bridgeOnShowDialogueFromDb");
  }
  function onDialogueEventDeleted(_ev) {
    callGodotBridge("bridgeOnCloseDialogueFromDb");
  }
  function sendPathPreviewToGodot(flatTiles) {
    console.log(`[BRIDGE] Sending path preview to Godot: ${flatTiles.length} numbers`);
    callGodotBridge("bridgeOnMoveQueueUpdate", ...flatTiles);
  }
  function rebuildLocalPathPreview(reason) {
    if (!localPlayerTile) {
      console.log(`[BRIDGE] rebuildLocalPathPreview skipped (${reason}) - no localPlayerTile yet`);
      return;
    }
    if (!localMoveQueueSteps || localMoveQueueSteps.length === 0) {
      console.log(`[BRIDGE] rebuildLocalPathPreview clearing (${reason}) - no remaining steps`);
      sendPathPreviewToGodot([]);
      return;
    }
    const flatTiles = buildAbsoluteTilesFromQueue(localPlayerTile, localMoveQueueSteps);
    console.log(
      `[BRIDGE] rebuildLocalPathPreview (${reason}) -> ${flatTiles.length / 2} tiles, first few: [${flatTiles.slice(0, 6).join(", ")}]`
    );
    sendPathPreviewToGodot(flatTiles);
  }
  async function attemptConnectWithToken(token, sourceLabel, uri, moduleName) {
    return new Promise((resolve, reject) => {
      let connectionResolved = false;
      const builder = DbConnection.builder().withUri(uri).withModuleName(moduleName).withToken(token).onConnect((...args) => {
        if (!connectionResolved) {
          connectionResolved = true;
          const conn = dbConnection || (args.length > 0 && args[0] ? args[0] : null);
          if (!conn) {
            reject(new Error("Connection object not available in onConnect callback"));
            return;
          }
          let newToken = void 0;
          if (args.length >= 3 && args[2]) {
            newToken = args[2];
          } else if (args.length >= 2 && args[1]) {
            const identityObj = args[1];
            if (identityObj && typeof identityObj === "object" && "token" in identityObj) {
              newToken = identityObj.token;
            }
          }
          if (newToken) {
            try {
              window.localStorage.setItem("stdb_auth_token", newToken);
              console.log("[BRIDGE] Cached SpacetimeDB token for fast reconnect");
            } catch (e) {
              console.warn("[BRIDGE] Failed to cache SpacetimeDB token:", e);
            }
          }
          try {
            const identityObj = conn.identity;
            if (identityObj) {
              localPlayerIdentity = identityObj.toString();
              const identityStr = identityObj.toHexString ? identityObj.toHexString() : identityObj.toString();
              console.log(`[BRIDGE] Connected to SpacetimeDB via ${sourceLabel} as ${identityStr}`);
              console.log("[BRIDGE] Local identity:", localPlayerIdentity);
            } else {
              console.warn("[BRIDGE] Identity property is null/undefined");
            }
          } catch (e) {
            console.warn("[BRIDGE] Could not get identity on connect:", e);
          }
          resolve(conn);
        }
      }).onConnectError((_ctx, err) => {
        if (!connectionResolved) {
          connectionResolved = true;
          const errorMsg = err?.message || String(err) || "Unknown connection error";
          console.error(`[BRIDGE] SpacetimeDB connect error via ${sourceLabel}:`, errorMsg);
          reject(new Error(errorMsg));
        }
      }).onDisconnect((_ctx, reason) => {
        console.warn("[BRIDGE] SpacetimeDB disconnected:", reason);
        dbConnection = null;
        subscriptionHandle = null;
        connectionPromise = null;
      });
      try {
        dbConnection = builder.build();
      } catch (e) {
        connectionResolved = true;
        reject(e);
      }
    });
  }
  async function connectToSpacetimeDB(host, database, token) {
    if (dbConnection) {
      return Promise.resolve({ success: true });
    }
    if (connectionPromise) {
      return connectionPromise;
    }
    connectionPromise = new Promise(async (resolve) => {
      try {
        let idToken;
        try {
          idToken = await ensureLoggedIn();
        } catch (error) {
          console.log("[BRIDGE] Redirecting to login...");
          connectionPromise = null;
          resolve({ success: false, error: "Redirecting to login" });
          return;
        }
        const uri = host || "ws://localhost:3000";
        const moduleName = database || "sn-server";
        const cachedToken = window.localStorage.getItem("stdb_auth_token");
        let conn = null;
        if (cachedToken && !token) {
          try {
            console.log("[BRIDGE] Attempting fast reconnect with cached SpacetimeDB token...");
            conn = await attemptConnectWithToken(cachedToken, "cached-token", uri, moduleName);
          } catch (err) {
            console.warn("[BRIDGE] Cached SpacetimeDB token failed, clearing and falling back to ID token:", err);
            try {
              window.localStorage.removeItem("stdb_auth_token");
            } catch (e) {
              console.warn("[BRIDGE] Failed to remove cached token:", e);
            }
            dbConnection = null;
          }
        }
        if (!conn) {
          const fallbackToken = token || idToken;
          console.log("[BRIDGE] Connecting with OIDC ID token...");
          try {
            conn = await attemptConnectWithToken(fallbackToken, "id-token", uri, moduleName);
          } catch (err) {
            const errorMsg = err?.message || String(err) || "Unknown connection error";
            console.error("[BRIDGE] Failed to connect with ID token:", errorMsg);
            dbConnection = null;
            connectionPromise = null;
            resolve({ success: false, error: errorMsg });
            return;
          }
        }
        try {
          setupSubscriptions(conn);
          console.log("[BRIDGE] Connection and subscriptions established successfully");
          resolve({ success: true });
        } catch (subErr) {
          const errorMsg = subErr?.message || String(subErr) || "Subscription setup error";
          console.error("[BRIDGE] Failed to set up subscriptions:", errorMsg);
          resolve({ success: true });
        }
      } catch (error) {
        const errorMsg = error?.message || String(error) || "Unknown error";
        console.error("[BRIDGE] Connection setup error:", errorMsg);
        dbConnection = null;
        connectionPromise = null;
        resolve({ success: false, error: errorMsg });
      }
    });
    return connectionPromise;
  }
  function init2(host, moduleName, token) {
    if (dbConnection) {
      return true;
    }
    if (connectionPromise) {
      return true;
    }
    connectToSpacetimeDB(host, moduleName, token).catch((error) => {
      console.error("[BRIDGE] Connection initialization error:", error);
    });
    return true;
  }
  function logoutUser() {
    logout().catch((error) => {
      console.error("[BRIDGE] Logout error:", error);
    });
  }
  function setupSubscriptions(conn) {
    if (!conn) {
      console.error("[BRIDGE] Cannot set up subscriptions: no connection");
      return;
    }
    try {
      const playerStateTable = conn.db.playerState;
      playerStateTable.onInsert((ctx, row) => {
        const identityStr = row.identity.toString();
        if (!localPlayerIdentity) {
          try {
            const identity = conn.identity;
            if (identity) {
              localPlayerIdentity = identity.toString();
              console.log("[BRIDGE] Local identity set in onInsert: " + localPlayerIdentity);
            }
          } catch (e) {
            console.warn("[BRIDGE] Could not get identity in onInsert:", e);
          }
        }
        const match = identityStr === localPlayerIdentity;
        if (match) {
          localPlayerState = {
            tile_x: row.tileX,
            tile_y: row.tileY,
            facing_x: row.facingX,
            facing_y: row.facingY,
            zone_id: row.zoneId || 1
          };
          localPlayerTile = { x: row.tileX, y: row.tileY };
          console.log(`[BRIDGE] Local player_state updated (insert): (${localPlayerState.tile_x},${localPlayerState.tile_y}) facing (${localPlayerState.facing_x},${localPlayerState.facing_y}) zone=${localPlayerState.zone_id}`);
          if (localMoveQueueSteps.length > 0) {
            rebuildLocalPathPreview("player_state insert");
          }
        }
        callGodotBridge(
          "bridgeOnPlayerStateUpdate",
          identityStr,
          row.tileX,
          row.tileY,
          row.facingX,
          row.facingY,
          row.zoneId || 1
        );
      });
      playerStateTable.onUpdate((ctx, oldRow, newRow) => {
        const identityStr = newRow.identity.toString();
        const match = identityStr === localPlayerIdentity;
        if (match) {
          const oldState = localPlayerState;
          const newState = {
            tile_x: newRow.tileX,
            tile_y: newRow.tileY,
            facing_x: newRow.facingX,
            facing_y: newRow.facingY,
            zone_id: newRow.zoneId || 1
          };
          if (!oldState || oldState.tile_x !== newState.tile_x || oldState.tile_y !== newState.tile_y || oldState.facing_x !== newState.facing_x || oldState.facing_y !== newState.facing_y || oldState.zone_id !== newState.zone_id) {
            localPlayerState = newState;
            localPlayerTile = { x: newState.tile_x, y: newState.tile_y };
            console.log(`[BRIDGE] Local player_state updated: (${newState.tile_x},${newState.tile_y}) facing (${newState.facing_x},${newState.facing_y}) zone=${newState.zone_id}`);
            if (localMoveQueueSteps.length > 0) {
              rebuildLocalPathPreview("player_state update");
            }
          }
        }
        callGodotBridge(
          "bridgeOnPlayerStateUpdate",
          identityStr,
          newRow.tileX,
          newRow.tileY,
          newRow.facingX,
          newRow.facingY,
          newRow.zoneId || 1
        );
      });
      playerStateTable.onDelete((ctx, row) => {
        const identityStr = row.identity.toString();
        const match = identityStr === localPlayerIdentity;
        if (match) {
          localPlayerState = null;
          localPlayerTile = null;
        }
        if (!match) {
          callGodotBridge("bridgeOnPlayerStateRemove", identityStr);
        }
      });
      const zoneCollisionTable = conn.db.zoneCollision;
      if (zoneCollisionTable) {
        zoneCollisionTable.onInsert((ctx, row) => {
          callGodotBridge("bridgeOnZoneCollisionUpdate", row.zoneId, row.ready, row.blockedCount);
        });
        zoneCollisionTable.onUpdate((ctx, oldRow, newRow) => {
          callGodotBridge("bridgeOnZoneCollisionUpdate", newRow.zoneId, newRow.ready, newRow.blockedCount);
        });
      } else {
        console.warn("[BRIDGE] ZoneCollision table not found in database");
      }
      const moveQueueTable = conn.db.moveQueue;
      if (moveQueueTable) {
        const forwardMoveQueueUpdate = (row) => {
          const identityStr = row.playerIdentity.toString();
          if (identityStr === localPlayerIdentity) {
            const { queue, queue_length } = row;
            const steps = parseQueue(queue);
            console.log(
              `[BRIDGE] MoveQueue update for local player: queue="${queue}" queue_length=${queue_length} parsed_steps=${steps.length}`
            );
            localMoveQueueSteps = steps;
            if (!localPlayerTile) {
              console.log("[BRIDGE] MoveQueue update but no localPlayerTile yet - will render once player_state arrives");
              return;
            }
            if (steps.length === 0) {
              console.log("[BRIDGE] No steps in queue, clearing path preview");
              rebuildLocalPathPreview("move_queue empty");
              return;
            }
            rebuildLocalPathPreview("move_queue update");
          }
        };
        moveQueueTable.onInsert((ctx, row) => {
          forwardMoveQueueUpdate(row);
        });
        moveQueueTable.onUpdate((ctx, oldRow, newRow) => {
          forwardMoveQueueUpdate(newRow);
        });
        moveQueueTable.onDelete((ctx, row) => {
          const identityStr = row.playerIdentity.toString();
          if (identityStr === localPlayerIdentity) {
            console.log("[BRIDGE] MoveQueue deleted for local player, clearing path preview");
            localMoveQueueSteps = [];
            sendPathPreviewToGodot([]);
          }
        });
      } else {
        console.warn("[BRIDGE] MoveQueue table not found in database");
      }
      const chatMessageTable = conn.db.chatMessage;
      if (chatMessageTable) {
        chatMessageTable.onInsert((ctx, row) => {
          const currentZoneId = localPlayerState?.zone_id || 1;
          if (row.zoneId !== currentZoneId) {
            console.debug(`[CHAT] Filtered message from zone ${row.zoneId} (current zone: ${currentZoneId})`);
            return;
          }
          console.log(`[CHAT] ${row.senderName}: ${row.text} (zone ${row.zoneId})`);
          const payload = {
            sender_name: row.senderName,
            text: row.text,
            zone_id: row.zoneId,
            created_at: String(row.createdAt)
          };
          emitToGodotChatListeners(payload);
          callGodotBridge(
            "bridgeOnChatMessageInsert",
            row.id.toString(),
            row.senderId.toString(),
            row.senderName,
            row.text,
            row.zoneId.toString(),
            row.createdAt.toString()
          );
        });
      } else {
        console.warn("[BRIDGE] ChatMessage table not found in database");
      }
      const questDebugSnapshotTable = conn.db.questDebugSnapshot;
      if (questDebugSnapshotTable) {
        const forwardQuestDebugSnapshot = (row) => {
          const identityStr = row.playerIdentity.toString();
          if (identityStr === localPlayerIdentity) {
            try {
              window.__questDebugSnapshot = row.jsonData;
              callGodotBridge("bridgeOnQuestDebugSnapshot");
            } catch (e) {
              console.error("[BRIDGE] Quest debug snapshot forward error:", e);
            }
          }
        };
        questDebugSnapshotTable.onInsert((ctx, row) => forwardQuestDebugSnapshot(row));
        questDebugSnapshotTable.onUpdate((ctx, _oldRow, newRow) => forwardQuestDebugSnapshot(newRow));
      } else {
        console.warn("[BRIDGE] QuestDebugSnapshot table not found in database");
      }
      const playerTable = conn.db.player;
      if (playerTable) {
        playerTable.onInsert((ctx, row) => {
          const identityStr = row.id.toString();
          if (!localPlayerIdentity) {
            try {
              const identity = conn.identity;
              if (identity) {
                localPlayerIdentity = identity.toString();
              }
            } catch (e) {
              console.warn("[BRIDGE] Could not get identity in Player onInsert:", e);
            }
          }
          const isLocal = identityStr === localPlayerIdentity;
          if (isLocal) {
            localPlayerDisplayName = row.displayName;
            console.log(`[BRIDGE] Local player display name updated: ${localPlayerDisplayName}`);
            if (typeof window !== "undefined" && window.godotDisplayNameRefreshCallback) {
              try {
                window.godotDisplayNameRefreshCallback([]);
              } catch (e) {
                console.debug("[BRIDGE] godotDisplayNameRefreshCallback not available yet");
              }
            }
          }
          callGodotBridge(
            "bridgeOnPlayerUpdate",
            identityStr,
            row.displayName,
            isLocal ? "1" : "0"
          );
        });
        playerTable.onUpdate((ctx, oldRow, newRow) => {
          const identityStr = newRow.id.toString();
          const isLocal = identityStr === localPlayerIdentity;
          if (isLocal) {
            localPlayerDisplayName = newRow.displayName;
            console.log(`[BRIDGE] Local player display name updated: ${localPlayerDisplayName}`);
            if (typeof window !== "undefined" && window.godotDisplayNameRefreshCallback) {
              try {
                window.godotDisplayNameRefreshCallback([]);
              } catch (e) {
                console.debug("[BRIDGE] godotDisplayNameRefreshCallback not available yet");
              }
            }
          }
          if (typeof window !== "undefined" && window.bridgeOnPlayerUpdate && typeof window.bridgeOnPlayerUpdate === "function") {
            callGodotBridge(
              "bridgeOnPlayerUpdate",
              identityStr,
              newRow.displayName,
              isLocal ? "1" : "0"
            );
          } else {
            console.debug(`[BRIDGE] bridgeOnPlayerUpdate not available yet, skipping forward (will retry on next update)`);
          }
        });
      } else {
        console.warn("[BRIDGE] Player table not found in database");
      }
      const npcDefinitionTable = conn.db.npcDefinition;
      if (npcDefinitionTable) {
        npcDefinitionTable.onInsert((ctx, row) => {
          npcDefs.set(row.npcDefId, { name: row.name, spriteId: row.spriteId, defaultDialogueKey: row.defaultDialogueKey });
        });
        npcDefinitionTable.onUpdate((ctx, oldRow, newRow) => {
          npcDefs.set(newRow.npcDefId, { name: newRow.name, spriteId: newRow.spriteId, defaultDialogueKey: newRow.defaultDialogueKey });
        });
        npcDefinitionTable.onDelete((ctx, row) => {
          npcDefs.delete(row.npcDefId);
        });
      }
      const npcSpawnTable = conn.db.npcSpawn;
      if (npcSpawnTable) {
        npcSpawnTable.onInsert((ctx, row) => onNpcSpawnAddedOrUpdated(row));
        npcSpawnTable.onUpdate((ctx, oldRow, newRow) => onNpcSpawnAddedOrUpdated(newRow));
        npcSpawnTable.onDelete((ctx, row) => onNpcSpawnDeleted(row));
      }
      const interactableDefinitionTable = conn.db.interactableDefinition;
      if (interactableDefinitionTable) {
        interactableDefinitionTable.onInsert((ctx, row) => {
          interactableDefs.set(row.interactableDefId, { displayName: row.displayName, spriteId: row.spriteId, defaultDialogueKey: row.defaultDialogueKey ?? "" });
        });
        interactableDefinitionTable.onUpdate((ctx, oldRow, newRow) => {
          interactableDefs.set(newRow.interactableDefId, { displayName: newRow.displayName, spriteId: newRow.spriteId, defaultDialogueKey: newRow.defaultDialogueKey ?? "" });
        });
        interactableDefinitionTable.onDelete((ctx, row) => {
          interactableDefs.delete(row.interactableDefId);
        });
      }
      const interactableSpawnTable = conn.db.interactableSpawn;
      if (interactableSpawnTable) {
        interactableSpawnTable.onInsert((ctx, row) => onInteractableSpawnAddedOrUpdated(row));
        interactableSpawnTable.onUpdate((ctx, oldRow, newRow) => onInteractableSpawnAddedOrUpdated(newRow));
        interactableSpawnTable.onDelete((ctx, row) => onInteractableSpawnDeleted(row));
      }
      const playerDialogueEventTable = conn.db.playerDialogueEvent;
      if (playerDialogueEventTable) {
        playerDialogueEventTable.onInsert((ctx, row) => {
          const rowIdStr = row.playerIdentity != null && typeof row.playerIdentity.toString === "function" ? row.playerIdentity.toString() : String(row.playerIdentity);
          const isLocal = isLocalPlayer(row.playerIdentity);
          console.log("[INTERACT_DEBUG] PlayerDialogueEvent insert: row.playerIdentity=%s localPlayerIdentity=%s isLocal=%s", rowIdStr, localPlayerIdentity, isLocal);
          if (isLocal)
            onDialogueEventAddedOrUpdated(row);
        });
        playerDialogueEventTable.onUpdate((ctx, oldRow, newRow) => {
          if (isLocalPlayer(newRow.playerIdentity))
            onDialogueEventAddedOrUpdated(newRow);
        });
        playerDialogueEventTable.onDelete((ctx, row) => {
          if (isLocalPlayer(row.playerIdentity))
            onDialogueEventDeleted(row);
        });
      }
      subscriptionHandle = conn.subscriptionBuilder().onApplied((_ctx) => {
        console.log("[BRIDGE] Player subscription applied");
        if (!localPlayerIdentity) {
          try {
            const identity = conn.identity;
            if (identity) {
              localPlayerIdentity = identity.toString();
              console.log("[BRIDGE] Local identity: " + localPlayerIdentity);
            }
          } catch (e) {
            console.warn("[BRIDGE] Could not get identity in onApplied:", e);
          }
        }
      }).onError((ctx, err) => {
        console.error("[BRIDGE] Subscription error:", err || ctx);
      }).subscribeToAllTables();
      console.log("[BRIDGE] Subscribed to player_state with callbacks");
    } catch (e) {
      console.error("[BRIDGE] Subscription error:", e);
      throw e;
    }
  }
  function subscribeToPlayerState() {
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot subscribe: no connection");
      return;
    }
    if (subscriptionHandle !== null) {
      console.log("[BRIDGE] Already subscribed, skipping");
      return;
    }
    setupSubscriptions(dbConnection);
  }
  async function moveTo(destX, destY) {
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot send move-to intent: no connection");
      return;
    }
    try {
      const dest_x = Number(destX);
      const dest_y = Number(destY);
      if (isNaN(dest_x) || isNaN(dest_y)) {
        console.error("[BRIDGE] moveTo: Invalid parameters - destX=" + destX + " destY=" + destY);
        throw new Error("Invalid destination coordinates");
      }
      const reducersObj = dbConnection.reducers;
      let reducerName = null;
      let moveToReducer = null;
      if (reducersObj["move_to"] && typeof reducersObj["move_to"] === "function") {
        reducerName = "move_to";
        moveToReducer = reducersObj["move_to"];
      } else if (reducersObj["moveTo"] && typeof reducersObj["moveTo"] === "function") {
        reducerName = "moveTo";
        moveToReducer = reducersObj["moveTo"];
      }
      if (!moveToReducer || !reducerName || typeof moveToReducer !== "function") {
        const available = Object.keys(reducersObj || {}).join(", ");
        console.error("[BRIDGE] move_to reducer not found. Available reducers: " + available);
        throw new Error("move_to reducer not found. Available: " + available);
      }
      const paramsObj = { destX: dest_x, destY: dest_y };
      const result = reducersObj[reducerName](paramsObj);
      if (result instanceof Promise) {
        try {
          await result;
        } catch (err) {
          console.error("[BRIDGE] moveTo Promise rejected:", err);
          throw err;
        }
      }
    } catch (e) {
      console.error("[BRIDGE] moveTo error:", e);
      console.error("[BRIDGE] moveTo error stack:", e.stack);
      throw e;
    }
  }
  async function sendMoveIntent(dx, dy) {
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot send move intent: no connection");
      return;
    }
    try {
      const moveReducer = dbConnection.reducers["move_player"] || dbConnection.reducers.movePlayer;
      if (moveReducer && typeof moveReducer === "function") {
        try {
          const reducersObj = dbConnection.reducers;
          let result;
          try {
            result = reducersObj.movePlayer({ dx, dy });
          } catch (e) {
            result = reducersObj.movePlayer(dx, dy);
          }
          if (result instanceof Promise) {
            try {
              await result;
            } catch (err) {
              console.error("[BRIDGE] Reducer Promise rejected:", err);
              throw err;
            }
          }
        } catch (callError) {
          console.error("[BRIDGE] Error calling reducer:", callError);
          console.error("[BRIDGE] Error details:", callError.message, callError.stack);
          throw callError;
        }
      } else {
        console.error("[BRIDGE] Move reducer not found. Available reducers:", Object.keys(dbConnection.reducers || {}));
        console.error("[BRIDGE] dbConnection.reducers structure:", JSON.stringify(dbConnection.reducers, null, 2));
      }
    } catch (e) {
      console.error("[BRIDGE] Move intent error:", e);
      console.error("[BRIDGE] Move intent error stack:", e.stack);
    }
  }
  function requestInteraction(tileX, tileY) {
    console.log("[INTERACT_DEBUG] TS requestInteraction called tileX=%s tileY=%s", tileX, tileY);
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot request interaction: no connection");
      return;
    }
    try {
      const reducersObj = dbConnection.reducers;
      const reducer2 = reducersObj["request_interaction"] || reducersObj.requestInteraction;
      if (reducer2 && typeof reducer2 === "function") {
        const tile_x = Number(tileX);
        const tile_y = Number(tileY);
        const paramsObj = { tileX: tile_x, tileY: tile_y };
        console.log("[INTERACT_DEBUG] TS calling reducer request_interaction with", paramsObj);
        const result = reducer2(paramsObj);
        if (result instanceof Promise) {
          result.catch((err) => console.error("[BRIDGE] request_interaction rejected:", err));
        }
        console.log("[INTERACT_DEBUG] TS request_interaction reducer invoked");
      } else {
        console.warn("[BRIDGE] request_interaction reducer not found");
      }
    } catch (e) {
      console.error("[BRIDGE] request_interaction error:", e);
    }
  }
  function sendDialogueChoice(eventId, optionId) {
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot send dialogue choice: no connection");
      return;
    }
    try {
      const reducersObj = dbConnection.reducers;
      const reducer2 = reducersObj["dialogue_choice"] || reducersObj.dialogueChoice;
      if (reducer2 && typeof reducer2 === "function") {
        const event_id = typeof eventId === "bigint" ? eventId : BigInt(Math.floor(Number(eventId)));
        const option_id = Number(optionId);
        const paramsObj = { eventId: event_id, optionId: option_id };
        const result = reducer2(paramsObj);
        if (result instanceof Promise) {
          result.catch((err) => console.error("[BRIDGE] dialogue_choice rejected:", err));
        }
      } else {
        console.warn("[BRIDGE] dialogue_choice reducer not found");
      }
    } catch (e) {
      console.error("[BRIDGE] send_dialogue_choice error:", e);
    }
  }
  function isConnected() {
    return dbConnection !== null && localPlayerIdentity !== null;
  }
  function getCurrentDisplayName() {
    if (!isConnected()) {
      return "";
    }
    if (localPlayerDisplayName) {
      return localPlayerDisplayName;
    }
    return "";
  }
  function getIdentity() {
    if (!dbConnection) {
      return null;
    }
    try {
      if (localPlayerIdentity) {
        return localPlayerIdentity;
      }
      const identityObj = dbConnection.identity;
      const identity = identityObj ? identityObj.toString() : null;
      if (identity) {
        localPlayerIdentity = identity;
        return identity;
      }
      return null;
    } catch (error) {
      console.error("[BRIDGE] Get identity error:", error);
      return null;
    }
  }
  function getLocalPlayerState() {
    return localPlayerState;
  }
  async function sendChat(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      console.warn("[BRIDGE] Cannot send empty chat message");
      return { success: false, error: "Message cannot be empty" };
    }
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot send chat: no connection");
      return { success: false, error: "Not connected to server" };
    }
    try {
      const reducersObj = dbConnection.reducers;
      const reducer2 = reducersObj["send_chat_message"] || reducersObj.sendChatMessage;
      if (!reducer2 || typeof reducer2 !== "function") {
        console.error("[BRIDGE] send_chat_message reducer not found");
        return { success: false, error: "send_chat_message reducer not found" };
      }
      let result;
      try {
        result = reducer2({ text: trimmed });
      } catch (e) {
        try {
          result = reducer2(trimmed);
        } catch (e2) {
          console.error("[BRIDGE] Error calling send_chat_message reducer:", e2);
          return { success: false, error: e2.message || "Unknown error" };
        }
      }
      if (result instanceof Promise) {
        await result;
      }
      console.log("[BRIDGE] Chat message sent:", trimmed);
      return { success: true };
    } catch (e) {
      const errorMsg = e.message || "Unknown error";
      console.error("[BRIDGE] Error sending chat message:", e);
      return { success: false, error: errorMsg };
    }
  }
  async function setDisplayName(displayName) {
    const trimmed = displayName.trim();
    if (!trimmed) {
      console.warn("[BRIDGE] Cannot set empty display name");
      return { success: false, error: "Display name cannot be empty" };
    }
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot set display name: no connection");
      return { success: false, error: "Not connected to server" };
    }
    try {
      const reducersObj = dbConnection.reducers;
      const reducer2 = reducersObj["set_display_name"] || reducersObj.setDisplayName;
      if (!reducer2 || typeof reducer2 !== "function") {
        console.error("[BRIDGE] set_display_name reducer not found");
        return { success: false, error: "set_display_name reducer not found" };
      }
      let result;
      try {
        result = reducer2({ newName: trimmed });
      } catch (e) {
        try {
          result = reducer2({ new_name: trimmed });
        } catch (e2) {
          try {
            result = reducer2(trimmed);
          } catch (e3) {
            console.error("[BRIDGE] Error calling set_display_name reducer:", e3);
            return { success: false, error: e3.message || "Unknown error" };
          }
        }
      }
      if (result instanceof Promise) {
        await result;
      }
      console.log("[BRIDGE] Display name set:", trimmed);
      return { success: true };
    } catch (e) {
      const errorMsg = e.message || "Unknown error";
      console.error("[BRIDGE] Error setting display name:", e);
      return { success: false, error: errorMsg };
    }
  }
  async function upsertBlockedTile(zoneId, x, y) {
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot upsert blocked tile: no connection");
      return false;
    }
    try {
      const reducersObj = dbConnection.reducers;
      if (!reducersObj) {
        console.warn("[BRIDGE] Reducers object not available");
        return false;
      }
      const reducer2 = reducersObj["upsert_blocked_tile"] || reducersObj.upsertBlockedTile;
      if (!reducer2 || typeof reducer2 !== "function") {
        console.warn("[BRIDGE] upsert_blocked_tile reducer not found. Available reducers:", Object.keys(reducersObj));
        console.warn("[BRIDGE] This usually means the client bindings need to be regenerated after adding new reducers to the server.");
        return false;
      }
      let result;
      try {
        result = reducer2({ zone_id: zoneId, x, y });
      } catch (e) {
        try {
          result = reducer2({ zoneId, x, y });
        } catch (e2) {
          try {
            result = reducer2(zoneId, x, y);
          } catch (e3) {
            console.error("[BRIDGE] Error calling upsert_blocked_tile reducer:", e3);
            return false;
          }
        }
      }
      if (result instanceof Promise) {
        await result;
      }
      return true;
    } catch (e) {
      console.error("[BRIDGE] Error upserting blocked tile:", e);
      return false;
    }
  }
  async function finalizeZoneCollision(zoneId) {
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot finalize zone collision: no connection");
      return false;
    }
    try {
      const reducersObj = dbConnection.reducers;
      if (!reducersObj) {
        console.warn("[BRIDGE] Reducers object not available");
        return false;
      }
      const reducer2 = reducersObj["finalize_zone_collision"] || reducersObj.finalizeZoneCollision;
      if (!reducer2 || typeof reducer2 !== "function") {
        console.warn("[BRIDGE] finalize_zone_collision reducer not found. Available reducers:", Object.keys(reducersObj));
        console.warn("[BRIDGE] This usually means the client bindings need to be regenerated after adding new reducers to the server.");
        return false;
      }
      let result;
      try {
        result = reducer2({ zone_id: zoneId });
      } catch (e) {
        try {
          result = reducer2({ zoneId });
        } catch (e2) {
          try {
            result = reducer2(zoneId);
          } catch (e3) {
            console.error("[BRIDGE] Error calling finalize_zone_collision reducer:", e3);
            return false;
          }
        }
      }
      if (result instanceof Promise) {
        await result;
      }
      console.log(`[BRIDGE] Finalized zone collision for zone ${zoneId}`);
      return true;
    } catch (e) {
      console.error("[BRIDGE] Error finalizing zone collision:", e);
      return false;
    }
  }
  function fetchQuestDebugSnapshot() {
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot fetch quest debug: no connection");
      return;
    }
    try {
      const reducersObj = dbConnection.reducers;
      const reducer2 = reducersObj["debug_get_player_quest_state"] || reducersObj.debugGetPlayerQuestState;
      if (reducer2 && typeof reducer2 === "function") {
        reducer2({});
        console.log("[BRIDGE] debug_get_player_quest_state reducer invoked");
      } else {
        console.warn("[BRIDGE] debug_get_player_quest_state reducer not found");
      }
    } catch (e) {
      console.error("[BRIDGE] fetchQuestDebugSnapshot error:", e);
    }
  }
  async function clearBlockedTilesForZone(zoneId) {
    if (!dbConnection) {
      console.error("[BRIDGE] Cannot clear blocked tiles: no connection");
      return false;
    }
    try {
      const reducersObj = dbConnection.reducers;
      if (!reducersObj) {
        console.warn("[BRIDGE] Reducers object not available");
        return false;
      }
      const reducer2 = reducersObj["clear_blocked_tiles_for_zone"] || reducersObj.clearBlockedTilesForZone;
      if (!reducer2 || typeof reducer2 !== "function") {
        console.warn("[BRIDGE] clear_blocked_tiles_for_zone reducer not found. Available reducers:", Object.keys(reducersObj));
        console.warn("[BRIDGE] This usually means the client bindings need to be regenerated after adding new reducers to the server.");
        return false;
      }
      let result;
      try {
        result = reducer2({ zone_id: zoneId });
      } catch (e) {
        try {
          result = reducer2({ zoneId });
        } catch (e2) {
          try {
            result = reducer2(zoneId);
          } catch (e3) {
            console.error("[BRIDGE] Error calling clear_blocked_tiles_for_zone reducer:", e3);
            return false;
          }
        }
      }
      if (result instanceof Promise) {
        await result;
      }
      return true;
    } catch (e) {
      console.error("[BRIDGE] Error clearing blocked tiles:", e);
      return false;
    }
  }
  async function bootstrap() {
    const urlParams = new URLSearchParams(window.location.search);
    const hasCode = urlParams.has("code");
    const hasState = urlParams.has("state");
    if (hasCode && hasState) {
      console.log("[BOOTSTRAP] Detected OIDC callback, handling...");
      try {
        await handleCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log("[BOOTSTRAP] Callback handled, URL cleaned");
      } catch (error) {
        console.error("[BOOTSTRAP] Callback error:", error);
        if (document.body) {
          document.body.innerHTML = `
                    <div style="color: white; text-align: center; padding: 2rem; font-family: Arial; background: #000;">
                        <h1>Authentication Error</h1>
                        <p>${error instanceof Error ? error.message : "Failed to complete login"}</p>
                        <button onclick="window.location.href='/'" style="padding: 10px 20px; font-size: 16px; margin: 10px; cursor: pointer;">Return to Home</button>
                    </div>
                `;
        }
        throw error;
      }
    }
    let idToken;
    try {
      idToken = await ensureLoggedIn();
      console.log("[BOOTSTRAP] User authenticated");
    } catch (error) {
      console.log("[BOOTSTRAP] Redirecting to login...");
      return;
    }
    console.log("[BOOTSTRAP] Connecting to SpacetimeDB...");
    const connectResult = await connectToSpacetimeDB();
    if (!connectResult.success) {
      console.error("[BOOTSTRAP] Failed to connect to SpacetimeDB:", connectResult.error);
      return;
    }
    console.log("[BOOTSTRAP] Bootstrap complete - ready for game initialization");
  }
  if (typeof window !== "undefined") {
    bootstrap().catch((error) => {
      console.error("[BRIDGE] Bootstrap error:", error);
    });
  }
  if (typeof window !== "undefined") {
    window.SNBridge = window.SNBridge || {};
    window.SNBridge.bootstrap = bootstrap;
    window.SNBridge.init = init2;
    window.SNBridge.connectToSpacetimeDB = connectToSpacetimeDB;
    window.SNBridge.subscribeToPlayerState = subscribeToPlayerState;
    window.SNBridge.logout = logoutUser;
    window.SNBridge.sendMoveIntent = sendMoveIntent;
    window.SNBridge.moveTo = moveTo;
    window.SNBridge.getIdentity = getIdentity;
    window.SNBridge.getLocalPlayerState = getLocalPlayerState;
    window.SNBridge.upsertBlockedTile = upsertBlockedTile;
    window.SNBridge.clearBlockedTilesForZone = clearBlockedTilesForZone;
    window.SNBridge.finalizeZoneCollision = finalizeZoneCollision;
    window.SNBridge.sendChat = sendChat;
    window.SNBridge.setDisplayName = setDisplayName;
    window.SNBridge.request_interaction = requestInteraction;
    window.SNBridge.send_dialogue_choice = sendDialogueChoice;
    window.SNBridge.fetchQuestDebugSnapshot = fetchQuestDebugSnapshot;
    window.SpacetimeBridge = window.SpacetimeBridge || {};
    window.SpacetimeBridge.getLocalPlayerState = getLocalPlayerState;
    window.SpacetimeBridge.getIdentity = getIdentity;
    console.log("[BRIDGE] SNBridge functions attached:", Object.keys(window.SNBridge));
    globalThis.network_client = {
      // Set display name (username)
      set_display_name: async (name) => {
        const result = await setDisplayName(name);
        return result;
      },
      // Send chat message
      send_chat_message: async (text) => {
        const result = await sendChat(text);
        return result;
      },
      // Register chat listener callback
      register_chat_listener: (cb) => {
        registerChatListener(cb);
      },
      // Get current display name (synchronous)
      get_current_display_name: () => {
        return getCurrentDisplayName();
      },
      // Check if SpacetimeDB is connected
      is_connected: () => {
        return isConnected();
      }
    };
    console.log("[BRIDGE] network_client global exposed for Godot integration");
    console.log("[BRIDGE] Added get_current_display_name()");
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        if (dbConnection) {
          try {
            console.log("[BRIDGE] Page unloading - attempting disconnect");
            dbConnection.disconnect();
          } catch (e) {
          }
        }
      });
      window.addEventListener("pagehide", () => {
        if (dbConnection) {
          try {
            console.log("[BRIDGE] Page hiding - attempting disconnect");
            dbConnection.disconnect();
          } catch (e) {
          }
        }
      });
    }
  }
})();
//# sourceMappingURL=spacetime-bridge.bundle.js.map
