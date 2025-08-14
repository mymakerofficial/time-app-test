export interface BaseServiceContext {}

export abstract class Service {
  protected constructor(_context: BaseServiceContext) {}
}
