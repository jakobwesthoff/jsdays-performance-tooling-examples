class Foobar {
    private name: string
    constructor(name: string) {
        this.name = name;
    }

    public getName() : string {
        return this.name;
        }
}

var f = new Foobar("Audience");
console.log(f.getName());
