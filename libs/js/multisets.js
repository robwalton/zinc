// Generated by CoffeeScript 2.0.2
(function() {
  var Mset, dicts;

  dicts = require("./dicts");

  Mset = class Mset {
    constructor(...items) {
      "coffee> new multisets.Mset(1, 2, 3)\nMset{d: Dict{indices: {...}, itemlist: [..., ..., ...], used: 3}}";
      var i, j, len1;
      this.d = new dicts.Dict();
      for (j = 0, len1 = items.length; j < len1; j++) {
        i = items[j];
        this.d.set(i, this.d.get(i, 0) + 1);
      }
    }

    * iter() {
      "coffee> (i for i from new multisets.Mset(1, 2, 2, 3, 3, 3).iter())\n[ 1, 2, 3 ]\ncoffee> (i for i from new multisets.Mset().iter())\n[]";
      var k, n, ref, results, x;
      ref = this.d.iter();
      results = [];
      for (x of ref) {
        [k, n] = x;
        results.push((yield k));
      }
      return results;
    }

    * iterdup() {
      "coffee> (i for i from new multisets.Mset(1, 2, 2, 3, 3, 3).iterdup())\n[ 1, 2, 2, 3, 3, 3 ]\ncoffee> (i for i from new multisets.Mset().iterdup())\n[]";
      var i, k, n, ref, results, x;
      ref = this.d.iter();
      results = [];
      for (x of ref) {
        [k, n] = x;
        results.push((yield* (function*() {
          var j, ref1, results1;
          results1 = [];
          for (i = j = 1, ref1 = n; 1 <= ref1 ? j <= ref1 : j >= ref1; i = 1 <= ref1 ? ++j : --j) {
            results1.push((yield k));
          }
          return results1;
        })()));
      }
      return results;
    }

    hash() {
      "coffee> a = new multisets.Mset(1, 2, 2, 3, 3, 3)\ncoffee> b = new multisets.Mset(3, 2, 3, 2, 3, 1)\ncoffee> c = new multisets.Mset(1, 2, 3)\ncoffee> a.hash() == b.hash()\ntrue\ncoffee> a.hash() == c.hash()\nfalse";
      var h, k, n, ref, x;
      h = 2485867687;
      ref = this.d.iter();
      for (x of ref) {
        [k, n] = x;
        h ^= (dicts.hash(k) << 5) + dicts.hash(n);
      }
      return h;
    }

    eq(other) {
      "coffee> a = new multisets.Mset(1, 2, 2, 3, 3, 3)\ncoffee> b = new multisets.Mset(3, 2, 3, 2, 3, 1)\ncoffee> c = new multisets.Mset(1, 2, 3)\ncoffee> a.eq(b)\ntrue\ncoffee> a.eq(c)\nfalse\ncoffee> (new multisets.Mset()).eq(new multisets.Mset())\ntrue";
      if (!(other instanceof Mset)) {
        return false;
      }
      return this.d.eq(other.d);
    }

    copy() {
      "coffee> a = new multisets.Mset(1, 2, 2, 3, 3, 3)\ncoffee> a.eq(a.copy())\ntrue\ncoffee> a is a.copy()\nfalse";
      return new Mset(...this.iterdup());
    }

    len() {
      "coffee> (new multisets.Mset()).len()\n0\ncoffee> (new multisets.Mset(1, 2, 2, 3, 3, 3)).len()\n6";
      var k, len, n, ref, x;
      len = 0;
      ref = this.d.iter();
      for (x of ref) {
        [k, n] = x;
        len += n;
      }
      return len;
    }

    add(other) {
      "coffee> a = new multisets.Mset(1, 2, 3)\ncoffee> b = new multisets.Mset(2, 3, 3)\ncoffee> a.add(b)\ncoffee> a.eq(new multisets.Mset(1, 2, 2, 3, 3, 3))\ntrue";
      var k, n, ref, x;
      ref = other.d.iter();
      for (x of ref) {
        [k, n] = x;
        this.d.set(k, this.d.get(k, 0) + n);
      }
      return this;
    }

    sub(other) {
      "coffee> a = new multisets.Mset(1, 2, 2, 3, 3, 3)\ncoffee> b = new multisets.Mset(2, 3, 3)\ncoffee> c = new multisets.Mset(1, 2, 3)\ncoffee> d = new multisets.Mset(1, 2, 2, 3, 3, 3)\ncoffee> a.sub(b)\ncoffee> a.eq(c)\ntrue\ncoffee> a.sub(c).len()\n0\ncoffee> c.sub(d).len()\n0";
      var k, m, n, ref, x;
      ref = other.d.iter();
      for (x of ref) {
        [k, n] = x;
        m = this.d.get(k, 0);
        if (m <= n) {
          this.d.del(k);
        } else {
          this.d.set(k, m - n);
        }
      }
      return this;
    }

    geq(other) {
      "coffee> a = new multisets.Mset(1, 2, 2, 3, 3, 3)\ncoffee> b = new multisets.Mset(2, 3, 3)\ncoffee> c = new multisets.Mset(1, 2, 3)\ncoffee> a.geq(b)\ntrue\ncoffee> b.geq(c)\nfalse";
      var k, n, ref, x;
      ref = other.d.iter();
      for (x of ref) {
        [k, n] = x;
        if (this.d.get(k, 0) < n) {
          return false;
        }
      }
      return true;
    }

    empty() {
      "coffee> a = new multisets.Mset(1, 2, 2, 3, 3, 3)\ncoffee> b = new multisets.Mset()\ncoffee> a.empty()\nfalse\ncoffee> b.empty()\ntrue";
      return this.d.used === 0;
    }

    count(value) {
      "coffee> a = new multisets.Mset(1, 2, 2, 3, 3, 3)\ncoffee> (a.count(i) for i in [0...4])\n[ 0, 1, 2, 3 ]        ";
      return this.d.get(value, 0);
    }

    map(func) {
      "coffee> a = new multisets.Mset(1, 2, 2, 3, 3, 3)\ncoffee> b = a.map((k, n) -> [k+1, n+1])\ncoffee> b.eq(new multisets.Mset(2, 2, 3, 3, 3, 4, 4, 4, 4))\ntrue";
      var copy, k, n, ref, x;
      copy = new Mset();
      ref = this.d.iter();
      for (x of ref) {
        [k, n] = x;
        copy.d.set(...func(k, n));
      }
      return copy;
    }

    toString() {
      "coffee> console.log new multisets.Mset(1, 2, 2, 3, 3, 3).toString()\n[1, 2, 2, 3, 3, 3]\ncoffee> console.log new multisets.Mset().toString()\n[]";
      var items, v;
      items = (function() {
        var ref, results;
        ref = this.iterdup();
        results = [];
        for (v of ref) {
          results.push(`${v}`);
        }
        return results;
      }).call(this);
      return `[${items.join(', ')}]`;
    }

  };

  module.exports = {
    Mset: Mset
  };

}).call(this);

//# sourceMappingURL=multisets.js.map
