import Entity from 

abstract class Component {
    static totalCount: number;

    id: number;
    parent: Entity;
    name: string;
    data: object;

    constuctor(parent: any) {
        this.parent = parent;
        this.id = ++Component.totalCount;
    }

    serialize(): object {
        return { id: this.id, name: this.name, data: this.data } // TODO convert to json
    }

    unserialize(id: number, name: string, data: object) {
        
    }
}

export default Component