export interface Printable {
    print(): string;
}

export function isPrintable(o: any): o is Printable {
    return o.print !== undefined;
  }