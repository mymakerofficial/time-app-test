export interface BaseServiceContext {}

export abstract class Service {
  protected constructor(context: BaseServiceContext) {}
}
