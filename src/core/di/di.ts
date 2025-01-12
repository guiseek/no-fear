import {Type} from '../../interfaces'
import {For, Key} from './token'
import {is} from './is'

const container = new Map()
const relations = new Map()

export const use = <T>(type: Key<T>): T => {
  const concrete = container.get(type)
  if (!concrete) throw `Provider ${type.name} não registrado`
  return concrete
}

const provide = <T>({for: key, use}: For<T>) => {
  const concrete = use ?? key

  if (is.function<T>(concrete)) {
    const deps = relations.get(key)

    if (is.class<T>(concrete)) {
      return new concrete(...deps)
    }

    return concrete(...deps)
  }

  return concrete as T
}

export function add<T>(provider: Type<T>): void
export function add<T>(provider: For<T>): void
export function add<T>(provider: Type<T> | For<T>) {
  provider = 'for' in provider ? provider : {for: provider}
  relations.set(provider.for, (provider.add ?? []).map(use))
  const provided = provide(provider)
  container.set(provider.for, provided)
}

export function set(...providers: For[]): void
export function set(...providers: Type[]): void
export function set(...providers: []) {
  providers.map(add)
}
