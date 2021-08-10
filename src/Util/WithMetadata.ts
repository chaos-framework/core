 
type Constructor = new (...args: any[]) => {};

export function withMetadata<TBase extends Constructor>(Base: TBase) {
  return class WithMetadata extends Base {
    metadata = new Map<string, string | number | boolean | undefined>();
 
    tag(tag: string) {
      if(!this.metadata.has(tag)) {
        this.metadata.set(tag, true);
      }
    }
  
    untag(tag: string) {
      this.metadata.delete(tag);
    }
  
    tagged(tag: string): boolean {
      return this.metadata.has(tag);
    }
  };
}