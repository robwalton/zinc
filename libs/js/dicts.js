// Generated by CoffeeScript 2.0.2
(function() {
  // Python3 dicts ported to CoffeeScript, inspired from a Python version at
  // https://code.activestate.com/recipes/578375/
  var DUMMY, Dict, FREE, KeyError, eq, hash;

  FREE = -1;

  DUMMY = -2;

  hash = function(obj) {
    var c, err, h, k, l, len, len1, m, v, x;
    try {
      return obj.hash();
    } catch (error) {
      err = error;
      h = 0;
      if (typeof obj === "string") {
        for (l = 0, len = obj.length; l < len; l++) {
          c = obj[l];
          h = (h << 5) - h + c.charCodeAt(0);
        }
      } else if (obj instanceof Array) {
        for (m = 0, len1 = obj.length; m < len1; m++) {
          x = obj[m];
          h = (h << 5) - h + hash(x);
        }
      } else if (obj instanceof Object) {
        for (k in obj) {
          v = obj[k];
          h = h ^ ((hash(k) << 5) - h + hash(v));
        }
      } else {
        h = hash(`${obj}`);
      }
      return h;
    }
  };

  eq = function(left, right) {
    var err, i, k, l, ref, v;
    try {
      return left.eq(right);
    } catch (error) {
      err = error;
      if (left instanceof Array) {
        if (!(right instanceof Array)) {
          return false;
        }
        if (right.length !== left.length) {
          return false;
        }
        for (i = l = 0, ref = left.length; 0 <= ref ? l <= ref : l >= ref; i = 0 <= ref ? ++l : --l) {
          if (!eq(left[i], right[i])) {
            return false;
          }
        }
        return true;
      } else if (left instanceof Object) {
        if (!(right instanceof Object)) {
          return false;
        }
        for (k in left) {
          v = left[k];
          if (right[k] == null) {
            return false;
          }
        }
        for (k in right) {
          v = right[k];
          if (!eq(left[k], right[k])) {
            return false;
          }
        }
        return true;
      } else {
        return left === right;
      }
    }
  };

  KeyError = class KeyError {
    constructor(message) {
      this.message = message;
      this.name = "KeyError";
    }

  };

  Dict = class Dict {
    constructor(init = {}) {
      var key, val;
      this.clear();
      for (key in init) {
        val = init[key];
        this.set(key, val);
      }
    }

    clear() {
      this.indices = {};
      this.itemlist = [];
      return this.used = 0;
    }

    len() {
      return this.used;
    }

    * _gen_probes(hashvalue) {
      var PERTURB_SHIFT, i, perturb, results;
      PERTURB_SHIFT = 5;
      if (hashvalue < 0) {
        hashvalue = -hashvalue;
      }
      i = hashvalue;
      yield i;
      perturb = hashvalue;
      results = [];
      while (true) {
        i = 5 * i + perturb + 1;
        results.push(perturb >>= PERTURB_SHIFT);
      }
      return results;
    }

    _lookup(key, hashvalue) {
      var freeslot, i, index, item, ref;
      freeslot = null;
      ref = this._gen_probes(hashvalue);
      for (i of ref) {
        index = this.indices[i];
        if (index === void 0) {
          index = FREE;
          if (freeslot === null) {
            return [FREE, i];
          } else {
            return [DUMMY, freeslot];
          }
        } else if (index === DUMMY) {
          if (freeslot === null) {
            freeslot = i;
          }
        } else {
          item = this.itemlist[index];
          if (item.key === key || item.hash === hashvalue && eq(item.key, key)) {
            return [index, i];
          }
        }
      }
    }

    set(key, value) {
      var hashvalue, i, index;
      hashvalue = hash(key);
      [index, i] = this._lookup(key, hashvalue);
      if (index < 0) {
        this.indices[i] = this.used;
        this.itemlist.push({
          key: key,
          value: value,
          hash: hashvalue
        });
        return this.used++;
      } else {
        return this.itemlist[index] = {
          key: key,
          value: value,
          hash: hashvalue
        };
      }
    }

    get(key) {
      var i, index;
      [index, i] = this._lookup(key, hash(key));
      if (index < 0) {
        throw new KeyError(`key ${key} not found`);
      }
      return this.itemlist[index].value;
    }

    del(key) {
      var i, index, j, lastindex, lastitem;
      [index, i] = this._lookup(key, hash(key));
      if (index < 0) {
        throw new KeyError(`key ${key} not found`);
      }
      this.indices[i] = DUMMY;
      this.used--;
      if (index !== this.used) {
        lastitem = this.itemlist[this.itemlist.length - 1];
        [lastindex, j] = this._lookup(lastitem.key, lastitem.hash);
        this.indices[j] = index;
        this.itemlist[index] = lastitem;
      }
      return this.itemlist.pop();
    }

    * iter() {
      var item, l, len, ref, results;
      ref = this.itemlist;
      results = [];
      for (l = 0, len = ref.length; l < len; l++) {
        item = ref[l];
        results.push((yield [item.key, item.value]));
      }
      return results;
    }

    has(key) {
      var i, index;
      [index, i] = this._lookup(key, hash(key));
      return index >= 0;
    }

    get(key, otherwise = null) {
      var i, index;
      [index, i] = this._lookup(key, hash(key));
      if (index < 0) {
        return otherwise;
      }
      return this.itemlist[index].value;
    }

    pop() {
      var item;
      if (this.user === 0) {
        throw new KeyError("cannot pop from empty dict");
      }
      item = this.itemlist[this.itemlist.length - 1];
      this.del(key);
      return [item.key, item.value];
    }

    toString() {
      var items, k, v;
      items = (function() {
        var ref, results, y;
        ref = this.iter();
        results = [];
        for (y of ref) {
          [k, v] = y;
          results.push(`${k}: ${v}`);
        }
        return results;
      }).call(this);
      return `{${items.join(', ')}}`;
    }

  };

  module.exports = {
    hash: hash,
    eq: eq,
    KeyError: KeyError,
    Dict: Dict
  };

}).call(this);

//# sourceMappingURL=dicts.js.map
