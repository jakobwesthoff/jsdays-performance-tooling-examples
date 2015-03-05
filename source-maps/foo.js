var Foobar = (function () {
    function Foobar(name) {
        this.name = name;
    }
    Foobar.prototype.getName = function () {
        return this.name;
    };
    return Foobar;
})();
var f = new Foobar("Audience");
console.log(f.getName());
//# sourceMappingURL=foo.js.map