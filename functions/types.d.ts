interface PagesFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>,
> {
  (context: EventContext<Env, Params, Data>): Response | Promise<Response>
}

interface EventContext<Env, Params extends string, Data> {
  request: Request
  env: Env
  params: Record<Params, string | string[]>
  data: Data
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>
  waitUntil: (promise: Promise<unknown>) => void
}
